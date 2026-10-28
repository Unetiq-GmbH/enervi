import mongoose from "mongoose";
import { ShortModel } from "../../database/shorts/shorts.model";
import { getShortImagesStorageClient } from "../../services/azureStorage";
import { uploadShortImageToAzureStorage } from "../../services/imageService";
import pinService from "../../services/pinService";
import { Response } from "express";
import { MulterRequest } from "../../types";

const postShort = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).send({
        message: "Request body can not be empty.",
      });
      return;
    }

    const { _id, title, message, hyperlink, postCode, housingCondition } =
      req.body;
    let { image, pin } = req.body;
    const { file } = req;
    pin = pin ? JSON.parse(pin) : null;
    image = image ? JSON.parse(image) : null;

    if (!title || !message || !(file || image)) {
      res.status(400).send({
        message: "Missing image, title or message",
      });
      return;
    }

    if (file) {
      const blobName = `${new Date().getTime()}-${file.originalname}`;
      const response = await uploadShortImageToAzureStorage({
        fileBuffer: file.buffer,
        blobName,
        contentType: file.mimetype,
      });

      if (image) {
        const storageClient = getShortImagesStorageClient();
        if (image.blobName)
          await storageClient.deleteBlobIfItExists(image.blobName);
      }

      image = {
        name: file.originalname,
        blobName,
        blobUrl: response.file.url,
      };
    }

    let updatedPin = null;
    if (pin) {
      updatedPin = await pinService.postPin({
        _id: pin._id,
        latlng: pin.latlng,
        name: pin.name,
        address: pin.address,
        description: pin.description,
        creator: pin.creator,
        markerIconType: pin.markerIconType,
      });
    } else {
      if (_id) {
        const existingShort = await ShortModel.findById(_id)
          .populate("pin")
          .exec();
        if (existingShort && existingShort.pin) {
          await pinService.deletePin(existingShort.pin._id);
        }
      }
    }

    const updatedShort = await ShortModel.findOneAndUpdate(
      { _id: _id ? _id : new mongoose.Types.ObjectId() },
      {
        image,
        title,
        message,
        hyperlink,
        postCode,
        housingCondition,
        pin: updatedPin?._id,
      },
      { upsert: true, new: true }
    )
      .populate({
        path: "pin",
        populate: {
          path: "address",
          model: "Address",
        },
      })
      .exec();

    res.json(updatedShort);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message ||
        "An error occurred while posting the Short.",
    });
  }
};

export default postShort;

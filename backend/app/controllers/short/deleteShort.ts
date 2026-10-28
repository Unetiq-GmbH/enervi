import { ShortModel } from "../../database/shorts/shorts.model";
import { getShortImagesStorageClient } from "../../services/azureStorage";
import pinService from "../../services/pinService";
import { Request, Response } from "express";
import { Types } from "mongoose";

const deleteShort = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const short = await ShortModel.findById(id).populate("pin").exec();

    if (short) {
      if (short.image.blobName) {
        const storageClient = getShortImagesStorageClient();
        await storageClient.deleteBlobIfItExists(short.image.blobName);
      }
      if (short.pin) {
        await pinService.deletePin(new Types.ObjectId(short.pin._id));
      }
    }

    await ShortModel.deleteOne({ _id: id });

    res.json();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message || "An error occurred while deleting the Pin.",
    });
  }
};

export default deleteShort;

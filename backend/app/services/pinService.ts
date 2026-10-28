import mongoose, { Document, Types } from "mongoose";
import { PinModel } from "../database/pins/pins.model";
import { AddressModel } from "../database/addresses/addresses.model";
import { getPinImagesStorageClient } from "./azureStorage";
import { IPostPin } from "../database/pins/pins.types";

const postPin = async (pinData: IPostPin): Promise<Document> => {
  const { _id, latlng, name, address, description, creator, markerIconType } =
    pinData;

  if (description) {
    for (const block of description.blocks) {
      if (block.type === "image") {
        const substring = block.data.file.url.substring(8);
        const [, , blobName] = substring.split("/");
        block.data.file.blobName = blobName;
      }
    }
  }

  let pinAddress = null;
  const streetLowerCase = RegExp(`^${address.street.trim()}`, "i");
  const cityLowerCase = RegExp(`^${address.city.trim()}`, "i");
  const existingAddress = await AddressModel.findOne({
    street: streetLowerCase,
    city: cityLowerCase,
    postCode: address.postCode,
  }).exec();

  if (existingAddress) pinAddress = existingAddress;
  else {
    pinAddress = await AddressModel.create({
      street: address.street.trim(),
      city: address.city.trim(),
      postCode: address.postCode,
    });
  }

  const updatedPin = await PinModel.findOneAndUpdate(
    { _id: _id ?? new mongoose.Types.ObjectId() },
    {
      latlng,
      name,
      address: pinAddress._id,
      description,
      creator,
      markerIconType,
    },
    { upsert: true, new: true }
  ).exec();

  return updatedPin;
};

const deletePin = async (_id: Types.ObjectId): Promise<void> => {
  const pin = await PinModel.findById(_id).exec();

  if (!pin) {
    throw new Error("Pin not found");
  }

  if (pin.description) {
    for (const block of pin.description.blocks) {
      if (block.type === "image") {
        const storageClient = getPinImagesStorageClient();
        await storageClient.deleteBlobIfItExists(block.data.file.blobName);
      }
    }
  }

  await PinModel.deleteOne({ _id: pin._id }).exec();
};

export default {
  postPin,
  deletePin,
};

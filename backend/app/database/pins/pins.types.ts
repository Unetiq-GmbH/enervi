import { Document, Model } from "mongoose";
import { IUser } from "../users/users.types";
import { LatLng } from "../../types";
import { IAddress, IAddressDocument } from "../addresses/addresses.types";
import { MarkerIconType } from "../../types";
import { OutputData } from "@editorjs/editorjs";

export interface IPin {
  latlng: LatLng;
  address: IAddress;
  name: string;
  creator: IUser;
  description: OutputData;
  markerIconType: MarkerIconType;
}

export interface IShortDocument extends Omit<IPin, "address">, Document {
  address: IAddressDocument;
}

export interface IPinDocument extends IPin, Document {}

export interface IPinModel extends Model<IPinDocument> {}

export interface IPostPin extends Omit<IPin, "address" | "creator"> {
  _id: string;
  address: Omit<IPin["address"], "postCode"> & { postCode: string };
  creator: string;
}

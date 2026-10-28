import { Document, Model } from "mongoose";
import { AzureImage } from "../../types";
import { IPin, IPinDocument } from "../pins/pins.types";

export type HousingConditionType =
  | "own-home"
  | "rented-flat"
  | "own-flat"
  | "other";

export interface IShort {
  image: AzureImage;
  title: string;
  message: string;
  hyperlink: string;
  pin: IPin | null;
  postCode: string;
  housingCondition: HousingConditionType;
}

export interface IShortDocument extends Omit<IShort, "pin">, Document {
  pin: IPinDocument | null;
}

export interface IShortDocument extends IShort, Document {}

export interface IShortModel extends Model<IShortDocument> {}

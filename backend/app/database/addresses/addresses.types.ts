import { Document, Model } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  postCode: number;
}

export interface IAddressDocument extends IAddress, Document {}

export interface IAddressModel extends Model<IAddressDocument> {}

import { Document, Model } from "mongoose";
import { IRole, IRoleDocument } from "../roles/roles.types";

export interface IUser {
  email: string;
  password: string;
  role: IRole;
}

export interface IUserDocument extends Omit<IUser, "role">, Document {
  role: IRoleDocument;
}

export interface IUserModel extends Model<IUserDocument> {}

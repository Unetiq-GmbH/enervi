import { model } from "mongoose";
import { IAddressDocument } from "./addresses.types";
import AddressSchema from "./addresses.schema";

export const AddressModel = model<IAddressDocument>("Address", AddressSchema);

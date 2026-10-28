import { Schema } from "mongoose";

const AddressSchema = new Schema(
  {
    street: String,
    postCode: String,
    city: String,
  },
  { timestamps: true }
);

export default AddressSchema;

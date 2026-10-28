import { Schema } from "mongoose";

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default RoleSchema;

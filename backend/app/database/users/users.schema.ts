import { Schema } from "mongoose";
// eslint-disable-next-line
const { RoleModel } = require("../roles/roles.model");

const UserSchema = new Schema(
  {
    email: { type: String, unique: true },
    password: String,
    role: { type: Schema.Types.ObjectId, ref: "Role" },
  },
  { timestamps: true }
);

export default UserSchema;

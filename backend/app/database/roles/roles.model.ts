import { model } from "mongoose";
import { IRoleDocument } from "./roles.types";
import RoleSchema from "./roles.schema";

export const RoleModel = model<IRoleDocument>("Role", RoleSchema);

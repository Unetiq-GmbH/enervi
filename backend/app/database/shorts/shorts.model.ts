import { model } from "mongoose";
import { IShortDocument } from "./shorts.types";
import ShortSchema from "./shorts.schema";

export const ShortModel = model<IShortDocument>("Short", ShortSchema);

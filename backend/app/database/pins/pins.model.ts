import { model } from "mongoose";
import { IPinDocument } from "./pins.types";
import PinSchema from "./pins.schema";

export const PinModel = model<IPinDocument>("Pin", PinSchema);

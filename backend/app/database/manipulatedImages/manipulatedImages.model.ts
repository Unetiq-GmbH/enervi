import { model } from "mongoose";
import { IManipulatedImageDocument } from "./manipulatedImages.types";
import ManipulatedImageSchema from "./manipulatedImages.schema";

export const ManipulatedImageModel = model<IManipulatedImageDocument>(
  "ManipulatedImage",
  ManipulatedImageSchema
);

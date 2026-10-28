import { Document, Model } from "mongoose";
import { AzureImage } from "../../types";

export interface IManipulatedImage {
  uuid: string;
  originalImage: AzureImage;
  manipulatedImageVariants: AzureImage[];
  visualizationType: string;
  adjustment: string;
  housingCondition: string;
  custom_prompt: string;
  custom_negative_prompt: string;
  flux_prompt: string;
  flux_object_to_detect: string;
  inProcess: boolean;
  sentToServer: boolean;
  error: boolean;
  lang: string;
}

export interface IManipulatedImageDocument
  extends IManipulatedImage,
    Document {}

export interface IManipulatedImageModel
  extends Model<IManipulatedImageDocument> {}

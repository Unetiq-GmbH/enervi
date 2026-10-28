import { Request as ExpressRequest } from "express";
import { Response } from "express";

export interface MulterRequest extends ExpressRequest {
  file: Express.Multer.File;
}

export type MarkerIconType = "default" | "wind power" | "solar" | "heat";

export interface AzureImage {
  name: string;
  blobUrl: string;
  blobName: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export type ControllerResponse = Promise<Response | void>;

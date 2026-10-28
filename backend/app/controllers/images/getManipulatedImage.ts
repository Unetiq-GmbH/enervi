import { Request, Response } from "express";
import { ManipulatedImageModel } from "../../database/manipulatedImages/manipulatedImages.model";
import { ControllerResponse } from "../../types";

async function getManipulatedImage(
  req: Request,
  res: Response
): ControllerResponse {
  const { imageManipulationUUID } = req.params;

  if (!imageManipulationUUID) {
    return res.status(400).send("Image manipulation UUID is required.");
  }

  const manipulatedImage = await ManipulatedImageModel.findOne({
    uuid: imageManipulationUUID,
  });

  if (!manipulatedImage) {
    return res.status(404).send("Manipulated image not found.");
  }

  res.status(200).send(manipulatedImage);
}

export default getManipulatedImage;

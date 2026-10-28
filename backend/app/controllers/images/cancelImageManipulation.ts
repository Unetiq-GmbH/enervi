import { Request, Response } from "express";
import { ManipulatedImageModel } from "../../database/manipulatedImages/manipulatedImages.model";
import { getScenarioImagesStorageClient } from "../../services/azureStorage";
import { ControllerResponse } from "../../types";

const cancelImageManipulation = async (
  req: Request,
  res: Response
): ControllerResponse => {
  const { imageManipulationUUID } = req.params;
  if (!imageManipulationUUID) {
    return res.status(400).send("imageManipulationUUID is required");
  }

  try {
    const image = await ManipulatedImageModel.findOne({
      uuid: imageManipulationUUID,
    });

    if (image) {
      const storageClient = getScenarioImagesStorageClient();
      if (image.originalImage.blobName)
        await storageClient.deleteBlobIfItExists(image.originalImage.blobName);

      await ManipulatedImageModel.deleteOne({ uuid: imageManipulationUUID });
    }

    res.status(200).send("image manipulation cancelled");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in cancelling image manipulation");
  }
};

export default cancelImageManipulation;

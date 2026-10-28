import { ManipulatedImageModel } from "../../database/manipulatedImages/manipulatedImages.model";
import { getScenarioImagesStorageClient } from "../../services/azureStorage";
import { Request, Response } from "express";

async function removeManipulatedImage(
  req: Request,
  res: Response
): Promise<Response> {
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

      if (image.originalImage.blobName) {
        await storageClient.deleteBlobIfItExists(image.originalImage.blobName);
      }
      for (const variant of image.manipulatedImageVariants) {
        if (variant?.blobName) {
          await storageClient.deleteBlobIfItExists(variant.blobName);
        }
      }
    }

    await ManipulatedImageModel.deleteMany({
      uuid: imageManipulationUUID,
    });

    return res.status(200).send("Manipulated image removed");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error in removing manipulated image");
  }
}

export default removeManipulatedImage;

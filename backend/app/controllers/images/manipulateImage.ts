import { ManipulatedImageModel } from "../../database/manipulatedImages/manipulatedImages.model";
import SocketEvents from "../../middleware/socket/socketEvents";
import eventEmitter from "../../middleware/event";
import { uploadScenarioImageToAzureStorage } from "../../services/imageService";
import { Response } from "express";
import { MulterRequest } from "../../types";
import VisualizationType from "../../enums/VisualizationType";

async function manipulateImage(
  req: MulterRequest,
  res: Response
): Promise<Response> {
  const { file } = req;
  const {
    visualizationType,
    adjustment,
    lang,
    housingCondition,
    custom_prompt,
    custom_negative_prompt,
    flux_prompt,
    flux_object_to_detect,
    imageManipulationUUID,
  } = req.body;

  if (!file.buffer || !visualizationType || !imageManipulationUUID) {
    return res
      .status(400)
      .send("Image as base64 and visualizationType are required");
  }

  if (visualizationType === VisualizationType.CustomPrompt && !custom_prompt) {
    return res
      .status(400)
      .send("Custom prompt is required for custom prompt visualization type");
  }

  if (
    visualizationType === VisualizationType.FluxFree &&
    !flux_prompt &&
    !flux_object_to_detect
  ) {
    return res
      .status(400)
      .send(
        "Flux prompt and flux object to detect are required for Flux visualization type"
      );
  }

  try {
    const blobName = `${new Date().getTime()}-original-${imageManipulationUUID}`;
    const uploadImageRes = await uploadScenarioImageToAzureStorage({
      fileBuffer: file.buffer,
      blobName,
      contentType: file.mimetype,
    });

    const { success, file: azureFile } = uploadImageRes;
    if (!success) {
      return res.status(500).send("An error occurred while saving the image");
    }

    const image = await ManipulatedImageModel.create({
      uuid: imageManipulationUUID,
      visualizationType,
      adjustment,
      lang,
      housingCondition,
      custom_prompt,
      custom_negative_prompt,
      flux_prompt,
      flux_object_to_detect,
      originalImage: {
        name: file.originalname,
        blobUrl: azureFile.url,
        blobName,
      },
      inProcess: true,
      sentToServer: false,
      error: false,
    });

    return res.send(image);
  } catch (error) {
    console.log(error);
    eventEmitter.emit(
      SocketEvents.imageManipulationFailed,
      imageManipulationUUID
    );
    return res.status(500).json("Error in manipulation");
  }
}

export default manipulateImage;

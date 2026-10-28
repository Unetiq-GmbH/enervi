import eventEmitter from "../../middleware/event";
import SocketEvents from "../../middleware/socket/socketEvents";
import { ManipulatedImageModel } from "../../database/manipulatedImages/manipulatedImages.model";
import { uploadScenarioImageToAzureStorage } from "../../services/imageService";
import { base64StringToBuffer } from "../../utils/file";
import { Request, Response } from "express";
import { AzureImage } from "../../types";

async function processManipulatedImage(
  req: Request,
  res: Response
): Promise<Response> {
  const { images = [], imageManipulationUUID, visualizationType } = req.body;

  if (!images?.length || !imageManipulationUUID) {
    eventEmitter.emit(
      SocketEvents.imageManipulationFailed,
      imageManipulationUUID
    );

    return res
      .status(400)
      .send("At least one image and imageManipulationUUID are required");
  }

  const imageRecord = await ManipulatedImageModel.findOne({
    uuid: imageManipulationUUID,
  });

  if (!imageRecord) {
    eventEmitter.emit(
      SocketEvents.imageManipulationFailed,
      imageManipulationUUID
    );

    return res
      .status(500)
      .send("Something went wrong while processing the manipulated image");
  }

  const uploadResults: AzureImage[] = [];

  for (let i = 0; i < images.length; i++) {
    const base64Image = images[i];
    const imageBuffer = base64StringToBuffer(base64Image);

    const blobName = `${Date.now()}-manipulated-${imageManipulationUUID}-${i}`;
    const uploadRes = await uploadScenarioImageToAzureStorage({
      fileBuffer: imageBuffer,
      blobName,
      contentType: "image/png",
    });

    if (!uploadRes.success) {
      return res
        .status(500)
        .send("An error occured while saving the manipulated image");
    }

    uploadResults.push({
      name: `manipulated-${imageRecord?.originalImage?.name}-${i}.png`,
      blobUrl: uploadRes.file.url,
      blobName,
    });
  }

  if (!uploadResults.length) {
    eventEmitter.emit(
      SocketEvents.imageManipulationFailed,
      imageManipulationUUID
    );

    return res
      .status(500)
      .send("An error occured while saving the manipulated image");
  }

  await ManipulatedImageModel.findOneAndUpdate(
    { uuid: imageManipulationUUID },
    {
      inProcess: false,
      error: false,
      manipulatedImageVariants: uploadResults,
      visualizationType,
    }
  ).catch(() => {
    eventEmitter.emit(
      SocketEvents.imageManipulationFailed,
      imageManipulationUUID
    );

    return res
      .status(500)
      .send("An error occured while saving the manipulated image");
  });

  eventEmitter.emit(
    SocketEvents.imageManipulationFinished,
    imageManipulationUUID
  );

  return res.status(200).send("manipulatedImage");
}

export default processManipulatedImage;

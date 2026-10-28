import axios from "axios";
import { ManipulatedImageModel } from "../../database/manipulatedImages/manipulatedImages.model";
import getGPUServerURL from "../../utils/getGPUServerURL";
import { Request, Response } from "express";
import getGPUServerHeaders from "../../helpers/getGPUServerHeaders";

async function onServerStatus(req: Request, res: Response): Promise<Response> {
  try {
    let URL = getGPUServerURL();
    URL = URL + "/visualize";

    const allPendingImages = await ManipulatedImageModel.find({
      inProcess: true,
      sentToServer: false,
    });

    if (allPendingImages.length === 0) return res.send("No images in queue");

    for (const pendingImage of allPendingImages) {
      try {
        if (!pendingImage.originalImage.blobUrl) {
          console.log(
            `Skipping image manipulation with undefined original image url: ${pendingImage.uuid}`
          );
          continue;
        }

        const image = await axios.get(pendingImage.originalImage.blobUrl, {
          responseType: "arraybuffer",
        });
        const base64Image = Buffer.from(image.data).toString("base64");

        const body = {
          image: base64Image,
          visualizationType: pendingImage.visualizationType,
          adjustment: pendingImage.adjustment,
          imageManipulationUUID: pendingImage.uuid,
          lang: pendingImage.lang,
          ...(pendingImage.custom_prompt && {
            custom_prompt: pendingImage.custom_prompt,
            custom_negative_prompt: pendingImage.custom_negative_prompt,
          }),
          ...(pendingImage.flux_prompt && {
            flux_prompt: pendingImage.flux_prompt,
            flux_object_to_detect: pendingImage.flux_object_to_detect,
          }),
        };

        const flaskResponse = await axios.post(
          URL,
          body,
          getGPUServerHeaders()
        );
        if (flaskResponse.status !== 200) {
          await ManipulatedImageModel.updateMany(
            { uuid: pendingImage.uuid },
            { inProcess: false, sentToServer: true, error: true }
          );
        } else {
          await ManipulatedImageModel.updateMany(
            { uuid: pendingImage.uuid },
            { sentToServer: true }
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    return res.send("Images in queue for manipulation");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error in checking server status");
  }
}

export default onServerStatus;

import schedule from "node-schedule";
import { ManipulatedImageModel } from "../database/manipulatedImages/manipulatedImages.model";
import { getScenarioImagesStorageClient } from "../services/azureStorage";

const EVERY_HOUR = "0 * * * *";

export default function scheduleOldImagesDeletion(): void {
  schedule.scheduleJob(EVERY_HOUR, async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const oldImages = await ManipulatedImageModel.find({
        createdAt: { $lt: oneHourAgo },
      });

      if (oldImages.length === 0) {
        console.log("No outdated manipulated images found");
        return;
      }

      const storageClient = getScenarioImagesStorageClient();

      for (const image of oldImages) {
        if (image.originalImage?.blobName) {
          await storageClient.deleteBlobIfItExists(
            image.originalImage.blobName
          );
        }

        for (const variant of image.manipulatedImageVariants || []) {
          if (variant?.blobName) {
            await storageClient.deleteBlobIfItExists(variant.blobName);
          }
        }

        await ManipulatedImageModel.deleteOne({ uuid: image.uuid });

        console.log(`Deleted image ${image.uuid}`);
      }
    } catch (error) {
      console.error("Failed to delete outdated manipulated images:", error);
    }
  });
}

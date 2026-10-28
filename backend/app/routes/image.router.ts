import express from "express";
import {
  cancelImageManipulation,
  checkServerStatus,
  getManipulatedImage,
  manipulateImage,
  onServerStatus,
  processFailure,
  processManipulatedImage,
  removeManipulatedImage,
  uploadBase64Image,
  uploadImageToAzureStorage,
} from "../controllers/images";
import MulterMemoryStorageUpload from "../middleware/multerMemoryStorageUpload";
import verifyFlaskServerAuthJWT from "../middleware/verifyFlaskServerAuthJWT";
import { MulterRequest } from "../types";
import { globalLimiter, perIpLimiter } from "../middleware/rateLimit";

export default (app: express.Application): void => {
  const router = express.Router();

  const upload = MulterMemoryStorageUpload();

  router.post("/azure", upload.single("image"), (req, res) => {
    const multerReq = req as MulterRequest;
    uploadImageToAzureStorage(multerReq, res);
  });

  router.post("/base64", uploadBase64Image);

  router.post("/GPU/ServerStatus", verifyFlaskServerAuthJWT, onServerStatus);

  router.post(
    "/manipulate",
    perIpLimiter,
    globalLimiter,
    upload.single("image"),
    (req, res) => {
      const multerReq = req as MulterRequest;
      manipulateImage(multerReq, res);
    }
  );

  router.post(
    "/manipulated",
    verifyFlaskServerAuthJWT,
    processManipulatedImage
  );

  router.post(
    "/manipulationFailed/:imageManipulationUUID",
    verifyFlaskServerAuthJWT,
    processFailure
  );

  router.get("/manipulate/:imageManipulationUUID", getManipulatedImage);

  router.delete("/manipulate/:imageManipulationUUID", removeManipulatedImage);

  router.delete(
    "/manipulate/cancel/:imageManipulationUUID",
    cancelImageManipulation
  );

  router.get("/check-server-status", checkServerStatus);

  app.use("/api/image", router);
};

import express from "express";
import {
  postShort,
  getShort,
  getShorts,
  deleteShort,
} from "../controllers/short";
import MulterMemoryStorageUpload from "../middleware/multerMemoryStorageUpload";
import { MulterRequest } from "../types";

export default (app: express.Application): void => {
  const router = express.Router();
  const upload = MulterMemoryStorageUpload();

  router.post("/", upload.single("uploadedImage"), (req, res) => {
    const multerReq = req as MulterRequest;
    postShort(multerReq, res);
  });

  router.get("/", getShorts);

  router.get("/:id", getShort);

  router.delete("/:id", deleteShort);

  app.use("/api/short", router);
};

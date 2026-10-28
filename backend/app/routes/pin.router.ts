import express from "express";
import {
  postPin,
  getPin,
  searchPin,
  getPins,
  deletePin,
} from "../controllers/pin";

export default (app: express.Application): void => {
  const router = express.Router();

  router.post("/", postPin);

  router.get("/", getPin);

  router.get("/all", getPins);

  router.get("/search", searchPin);

  router.delete("/:id", deletePin);

  app.use("/api/pin", router);
};

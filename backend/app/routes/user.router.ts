import express from "express";
import { getUserByEmail } from "../controllers/user";
import authMiddleware from "../middleware/authMiddleware";

export default (app: express.Application): void => {
  const router = express.Router();

  router.get("/", authMiddleware, getUserByEmail);

  app.use("/api/user", router);
};

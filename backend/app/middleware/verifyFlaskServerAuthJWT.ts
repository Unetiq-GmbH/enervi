import { Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
import jwt from "jsonwebtoken";

export default function verifyFlaskServerAuthJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  dotenv.config();

  const EXPRESS_FLASK_KEY = process.env.EXPRESS_FLASK_KEY;

  if (!EXPRESS_FLASK_KEY) {
    return res.status(500).send("Express Flask Key not found");
  }

  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied");

  const [bearer, actualToken] = token.split(" ");
  if (bearer !== "Bearer") return res.status(400).send("Invalid token");

  try {
    jwt.verify(actualToken, EXPRESS_FLASK_KEY);
    next();
  } catch (err) {
    return res.status(400).send("Invalid token");
  }
}

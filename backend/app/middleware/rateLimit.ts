import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

const MINUTE = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 20;
const MAX_REQUESTS_PER_IP_PER_MINUTE = 3;

export const perIpLimiter = rateLimit({
  windowMs: MINUTE,
  max: MAX_REQUESTS_PER_IP_PER_MINUTE,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      message: "Too many requests from your IP, please try again later.",
    });
  },
});

let globalRequests = 0;
let lastReset = Date.now();

export function globalLimiter(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const now = Date.now();

  if (now - lastReset > MINUTE) {
    globalRequests = 0;
    lastReset = now;
  }

  if (globalRequests >= MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({
      message: "The server is overloaded. Try again later.",
    });
  }

  globalRequests++;
  next();
}

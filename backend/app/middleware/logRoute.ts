import { Request, Response, NextFunction } from "express";

const logRoute = (req: Request, res: Response, next: NextFunction): void => {
  const currentDateTime = new Date().toLocaleString();
  const { statusCode } = res;
  const { method, url } = req;
  console.log(`[${currentDateTime}] ${statusCode} ${method} ${url}`);
  next();
};

export default logRoute;

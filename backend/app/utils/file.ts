import { Request as ExpressRequest } from "express";

interface MulterRequest extends ExpressRequest {
  file: Express.Multer.File;
}

interface FileDetails {
  file: Buffer;
  fileName: string;
  contentType: string;
}

const getFileFromRequest = (req: MulterRequest): FileDetails | null => {
  if (req.file) {
    const file = req.file.buffer;
    const fileName = req.file.originalname;
    const contentType = req.file.mimetype;
    return { file, fileName, contentType };
  }
  return null;
};

const base64StringToBuffer = (base64String: string): Buffer => {
  const buffer = Buffer.from(base64String, "base64");
  return buffer;
};

export { getFileFromRequest, base64StringToBuffer };

import { uploadPinImageToAzureStorage } from "../../services/imageService";
import { Response } from "express";
import { MulterRequest } from "../../types";

const uploadImageToAzureStorage = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  try {
    const { file } = req;
    if (file) {
      const blobName = `${new Date().getTime()}-${file.originalname}`;

      const response = await uploadPinImageToAzureStorage({
        fileBuffer: file.buffer,
        blobName,
        contentType: file.mimetype,
      });

      res.json(response);
    } else {
      res.status(400).json({ success: 0, message: "No file uploaded" });
    }
  } catch (error) {
    res.status(500).json({ success: 0, message: "Internal Server Error" });
  }
};

export default uploadImageToAzureStorage;

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

const uploadBase64Image = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { imageSrc } = req.body;
    const base64Data = imageSrc.replace(/^data:image\/png;base64,/, "");
    const binaryData = Buffer.from(base64Data, "base64");

    const uniqueFileName = uuidv4() + ".jpeg";
    const filePath = path.join(__dirname, "../../../uploads", uniqueFileName);
    fs.writeFile(filePath, binaryData, (error) => {
      if (error) {
        return res.status(500).send("Error creating file");
      }

      const hostUrl = `${req.protocol}://${req.get("host")}`;
      const imageUrl = `${hostUrl}/${uniqueFileName}`;
      res.send(imageUrl);
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

export default uploadBase64Image;

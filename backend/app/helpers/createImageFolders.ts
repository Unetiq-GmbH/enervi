import fs from "fs";
import path from "path";

// Add folder for storing images /uploads/editorImages
const createImageFolders = (): void => {
  const uploadFolder = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);
  const editorImagesFolder = path.join(__dirname, "../../uploads/editorImages");
  if (!fs.existsSync(editorImagesFolder)) fs.mkdirSync(editorImagesFolder);
};

export default createImageFolders;

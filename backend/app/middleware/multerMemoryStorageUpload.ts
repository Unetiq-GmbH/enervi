import multer from "multer";

const MulterMemoryStorageUpload = () => {
  const storage = multer.memoryStorage();
  return multer({ storage });
};

export default MulterMemoryStorageUpload;

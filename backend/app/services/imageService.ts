import {
  getScenarioImagesStorageClient,
  getPinImagesStorageClient,
  getShortImagesStorageClient,
  Storage,
} from "./azureStorage";

interface UploadParams {
  fileBuffer: Buffer;
  blobName: string;
  contentType: string;
}

const uploadImageToAzureStorage = async (
  fileBuffer: Buffer,
  blobName: string,
  contentType: string,
  storageClient: Storage
) => {
  await storageClient.uploadData({
    fileBuffer,
    blobName,
    contentType,
  });
  const imageData = storageClient.getBlockBlobClient(blobName);
  const imageUrl = imageData.url;

  const response = {
    success: 1,
    file: {
      url: imageUrl,
    },
  };

  return response;
};

const uploadScenarioImageToAzureStorage = async ({
  fileBuffer,
  blobName,
  contentType,
}: UploadParams) => {
  const storageClient = getScenarioImagesStorageClient();
  return await uploadImageToAzureStorage(
    fileBuffer,
    blobName,
    contentType,
    storageClient
  );
};

const uploadPinImageToAzureStorage = async ({
  fileBuffer,
  blobName,
  contentType,
}: UploadParams) => {
  const storageClient = getPinImagesStorageClient();
  return await uploadImageToAzureStorage(
    fileBuffer,
    blobName,
    contentType,
    storageClient
  );
};

const uploadShortImageToAzureStorage = async ({
  fileBuffer,
  blobName,
  contentType,
}: UploadParams) => {
  const storageClient = getShortImagesStorageClient();
  return await uploadImageToAzureStorage(
    fileBuffer,
    blobName,
    contentType,
    storageClient
  );
};

export {
  uploadScenarioImageToAzureStorage,
  uploadPinImageToAzureStorage,
  uploadShortImageToAzureStorage,
};

import AzureProvider from "./provider";
import { BlockBlobClient } from "@azure/storage-blob";

interface UploadProps {
  fileBuffer: Buffer;
  blobName: string;
  contentType: string;
}

class Storage {
  private provider: AzureProvider;

  constructor(provider: AzureProvider) {
    this.provider = provider;
  }

  getBlockBlobClient(blobName: string): BlockBlobClient {
    if (!blobName) throw new Error("Blob name must be provided");

    return this.provider.getBlockBlobClient(blobName);
  }

  async uploadData({
    blobName,
    fileBuffer,
    contentType,
  }: UploadProps): Promise<void> {
    if (!blobName || !fileBuffer)
      throw new Error("File name and buffer must be provided");

    await this.provider.uploadData({ blobName, fileBuffer, contentType });
  }

  async deleteBlobIfItExists(blobName: string): Promise<void> {
    if (!blobName) throw new Error("File name must be provided");

    await this.provider.deleteBlobIfItExists(blobName);
  }
}

export default Storage;

import {
  BlobServiceClient,
  BlockBlobClient,
  BlobDeleteOptions,
  ContainerClient,
} from "@azure/storage-blob";

interface UploadProps {
  fileBuffer: Buffer;
  blobName: string;
  contentType: string;
}

class AzureProvider {
  private connectionString: string;
  private containerName: string;
  private client!: BlobServiceClient;
  private containerClient!: ContainerClient;

  constructor(connectionString: string, containerName: string) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.connect();
  }

  private connect(): void {
    this.client = BlobServiceClient.fromConnectionString(this.connectionString);
    this.containerClient = this.client.getContainerClient(this.containerName);
  }

  public getBlockBlobClient(blobName: string): BlockBlobClient {
    return this.containerClient.getBlockBlobClient(blobName);
  }

  public async uploadData(props: UploadProps): Promise<void> {
    const { fileBuffer, blobName, contentType } = props;

    const blobClient = this.getBlockBlobClient(blobName);
    await blobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
  }

  public async deleteBlobIfItExists(blobName: string): Promise<void> {
    const options: BlobDeleteOptions = {
      deleteSnapshots: "include",
    };

    const blockBlobClient = this.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists(options);
  }
}

export default AzureProvider;

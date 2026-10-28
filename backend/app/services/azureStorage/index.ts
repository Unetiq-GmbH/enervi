import Storage from "./storage";
import AzureProvider from "./provider";
import { getEnvVariable } from "../../utils";

let instance: Storage | null = null;

const getStorageClient = (containerName: string): Storage | null => {
  if (!instance) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined");
    }
    const azure = new AzureProvider(connectionString, containerName);

    instance = new Storage(azure);
  }

  return instance;
};

const getPinImagesStorageClient = (): Storage => {
  return getStorageClientFromEnv("AZURE_STORAGE_PIN_IMAGES_CONTAINER");
};

const getScenarioImagesStorageClient = (): Storage => {
  return getStorageClientFromEnv("AZURE_STORAGE_SCENARIO_IMAGES_CONTAINER");
};

const getShortImagesStorageClient = (): Storage => {
  return getStorageClientFromEnv("AZURE_STORAGE_SHORT_IMAGES_CONTAINER");
};

const getStorageClientFromEnv = (envVarName: string): Storage => {
  const containerName = getEnvVariable(envVarName);
  const storageClient = getStorageClient(containerName);

  if (!storageClient) {
    throw new Error(`Failed to get storage client for ${envVarName}`);
  }

  return storageClient;
};

export {
  Storage,
  getStorageClient,
  getPinImagesStorageClient,
  getScenarioImagesStorageClient,
  getShortImagesStorageClient,
};

import { Buffer } from "buffer";

export const getStorage = (key: string, defaultValue = null) => {
  const data = window.localStorage.getItem(key);

  if (!data) return defaultValue;

  try {
    const decodedData = decodeURIComponent(
      Buffer.from(data, "base64").toString("utf-8")
    );
    return JSON.parse(decodedData);
  } catch (error) {
    console.error(`Failed to parse stored data for key ${key}:`, error);
    return defaultValue;
  }
};

export const setStorage = (key: string, data: unknown): void => {
  try {
    const encodedData = Buffer.from(JSON.stringify(data), "utf-8").toString(
      "base64"
    );
    window.localStorage.setItem(key, encodedData);
  } catch (error) {
    console.error("Failed to set storage data:", error);
  }
};

export const removeStorage = (key: string) => {
  window.localStorage.removeItem(key);
};

import { ImageSrc, ManipulatedImage } from "../types";
import api from "./index";

const BASE = "/image";

export const uploadImageToServer = async (imageSrc: ImageSrc) => {
  return api
    .post(`${BASE}/base64`, {
      imageSrc,
    })
    .then((res) => res.data);
};

export async function manipulateImage(data: FormData) {
  const res = await api.post(`${BASE}/manipulate`, data, {
    headers: {
      "content-type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getManipulatedImage(
  imageManipulationUUID: string
): Promise<ManipulatedImage> {
  const res = await api.get(`${BASE}/manipulate/${imageManipulationUUID}`);
  return res.data;
}

export async function removeManipulatedImage(imageManipulationUUID: string) {
  const res = await api.delete(`${BASE}/manipulate/${imageManipulationUUID}`);
  return res.data;
}

export async function cancelImageManipulation(imageManipulationUUID: string) {
  const res = await api.delete(
    `${BASE}/manipulate/cancel/${imageManipulationUUID}`
  );
  return res.data;
}

export async function checkServerStatus() {
  const res = await api.get(`${BASE}/check-server-status`);
  return res;
}

export const uploadImageToServerFromEditor = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await api.post(`${BASE}/azure`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Image upload failed");
  }
};

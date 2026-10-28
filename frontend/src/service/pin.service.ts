import { getMarkerFromOpenStreetMap } from "./openStreetMap.service";
import api from "./index";
import { Coordinates, Pin } from "../types";

const BASE = "/pin";

export const postPin = async (data: Pin) => {
  return api
    .post(`${BASE}`, {
      data,
    })
    .then((res) => res.data);
};

export const getPin = async ({ lat, lng }: Coordinates) => {
  return api.get(`${BASE}?lat=${lat}&lng=${lng}`).then((res) => res.data);
};

export const getPins = async () => {
  return api.get(`${BASE}/all`).then((res) => res.data);
};

export const searchPin = async (query: string) => {
  return api.get(`${BASE}/search?q=${query}`).then((res) => res.data);
};

export const deletePin = async (id: string) => {
  return api.delete(`${BASE}/${id}`).then((res) => res.data);
};

export const getPinFromOpenStreetMapByCoordinates = async (
  coordinates: Coordinates
) => {
  const marker = await getMarkerFromOpenStreetMap(coordinates);

  return {
    address: {
      city:
        marker?.address?.town ||
        marker?.address?.city ||
        marker?.address?.village,
      postCode: marker?.address?.postcode,
      street: `${marker?.address?.road} ${
        marker?.address?.house_number ? ` ${marker?.address?.house_number}` : ""
      }`,
    },
    latlng: {
      lat: Number(marker?.lat),
      lng: Number(marker?.lon),
    },
  };
};

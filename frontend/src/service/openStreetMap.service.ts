import axios, { AxiosResponse } from "axios";
import { Coordinates } from "../types";

const REVERSE_GEOCODING_SEARCH_URL =
  "https://nominatim.openstreetmap.org/reverse?format=jsonv2";

export const getMarkerFromOpenStreetMap = async ({ lat, lng }: Coordinates) => {
  return axios
    .get(
      `${REVERSE_GEOCODING_SEARCH_URL}&lat=${lat}&lon=${lng}&accept-language=de-DE`,
      {
        headers: {
          "Access-Control-Allow-Origin": "https://o2cj2q.csb.app",
        },
      }
    )
    .then((res: AxiosResponse) => res.data);
};

export const getCoordinatesFromOpenStreetMap = async (query: string) => {
  const params = {
    q: query,
    format: "json",
  };
  return axios.get("https://nominatim.openstreetmap.org/search", {
    params,
  });
};

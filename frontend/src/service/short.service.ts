import api from "./index";
import { appendQueryParamsToUrl } from "../utils";
import { AxiosError } from "axios";

const BASE = "/short";

export const postShort = async (data: FormData) => {
  return api
    .post(`${BASE}`, data, {
      headers: {
        "content-type": "multipart/form-data",
      },
    })
    .then((res) => res.data)
    .catch((error: AxiosError) => error);
};

export const getShort = async (id: string) => {
  return api.get(`${BASE}/short?id=${id}`).then((res) => res.data);
};

export const getShorts = async ({
  housingCondition,
  postCode,
}: {
  housingCondition?: string;
  postCode?: string;
} = {}) => {
  const url = appendQueryParamsToUrl(`${BASE}`, { housingCondition, postCode });
  return api.get(url).then((res) => res.data);
};

export const deleteShort = async (id: string) => {
  return api.delete(`${BASE}/${id}`).then((res) => res.data);
};

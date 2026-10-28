import api from "./index";
import { setToken } from "../utils/auth";

const BASE = "/user";

export const getUserByEmail = async (email: string) => {
  return api
    .get(`${BASE}?email=${email}`, await setToken())
    .then((res) => res.data);
};

import { getStorage } from "./storage";

export const setToken = async (): Promise<{
  headers: { Authorization: string };
}> => {
  const user = getStorage("user");

  if (user?.token) {
    const token = user.token;
    return { headers: { Authorization: `Bearer ${token}` } };
  } else {
    throw new Error("No logged in user found.");
  }
};

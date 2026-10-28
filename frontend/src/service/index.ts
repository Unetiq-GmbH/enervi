import axios from "axios";

const APP_URL = import.meta.env.VITE_REACT_APP_URL;

const api = axios.create({
  baseURL: `${APP_URL}/api`,
});

// Globally handle "Access denied" errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    const responseData = error?.response?.data;
    // 403: Access Denied
    if (statusCode === 403) {
      throw new Error("Insufficient Access Rights");
    } else if (responseData?.code === "tokenExpired") {
      window.location.replace("/login?reason=tokenExpired");
    }

    // Add message from server to error message object
    if (responseData?.message) {
      error.message = responseData.message;
    }

    throw error;
  }
);

export default api;

import { backendURL } from "@/constants/constant";
import axios from "axios";

const api = axios.create({
  baseURL: backendURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    if (status === 401) {
      localStorage.removeItem("accessToken");

      window.location.href = "/login";
    }

    return Promise.reject({
      status: error?.response?.status,
      message,
      error: error?.response?.data?.errors || [],
    });
  },
);

export default api;

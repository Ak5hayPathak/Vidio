import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:15000/api/v1",
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: "http://localhost:15000/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry a request more than once
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshApi.post("/users/refresh-token");

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
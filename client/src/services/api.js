// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:15000/api/v1",
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: "http://localhost:15000/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    //console.log("interceptor called")

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      // Only one refresh call in flight at a time.
      // Everyone else awaits the SAME promise instead of starting their own.
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshApi.post("/users/refresh-token").finally(() => {
          isRefreshing = false;
        });
      }

      await refreshPromise;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default api;
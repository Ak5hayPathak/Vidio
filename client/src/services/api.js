import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:15000/api/v1",
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: "http://localhost:15000/api/v1",
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 Unauthorized
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Never retry the same request more than once
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark request as retried
    originalRequest._retry = true;

    try {
      /*
       * If another request is already refreshing the token,
       * wait for that same refresh request.
       */
      if (!refreshPromise) {
        refreshPromise = refreshApi
          .post("/users/refresh-token")
          .finally(() => {
            refreshPromise = null;
          });
      }

      // Wait until a new access token has been generated
      await refreshPromise;

      // Retry the original request.
      // Browser automatically sends the new httpOnly cookie.
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
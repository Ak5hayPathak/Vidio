import axios from "axios";

const API_BASE_URL = "http://localhost:15000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

// Requests that should NEVER trigger an access-token refresh.
const noRefreshUrls = [
  "/users/login",
  "/users/register",
  "/users/logout",
  "/users/refresh-token",
  "/users/forgot-password",
  "/users/reset-password",
];

function shouldSkipRefresh(url = "") {
  return noRefreshUrls.some((endpoint) => url.includes(endpoint));
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // No response or not a 401.
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Don't refresh requests that are explicitly excluded.
    if (shouldSkipRefresh(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Don't retry the same request more than once.
    if (originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // If another request is already refreshing the token,
      // wait for that same refresh request.
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = refreshApi
          .post("/users/refresh-token")
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      await refreshPromise;

      // Access token cookie has now been refreshed.
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default api;

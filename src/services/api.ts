import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/auth";

const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// Helpers para tokens
const getAccessToken = (): string | null => localStorage.getItem("accessToken");
const getRefreshToken = (): string | null => localStorage.getItem("refreshToken");

// Request interceptor: anexa Authorization se existir
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipagem para items na fila de refresh
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

// Refresh logic (quando 401)
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token as string);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError<unknown>) => {
    const error = err; // nome mais claro
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = "Bearer " + token;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // sem refresh token: limpa e rejeita
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const resp = await axios.post(
          `${BASE}/token/refresh/`,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
        const newAccess: string = resp.data.access;
        localStorage.setItem("accessToken", newAccess);
        api.defaults.headers.common["Authorization"] = "Bearer " + newAccess;
        processQueue(null, newAccess);
        isRefreshing = false;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = "Bearer " + newAccess;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
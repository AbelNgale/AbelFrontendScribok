import api from "./api";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export interface User {
  id?: number;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export const login = async (email: string, password: string) => {
  const resp = await api.post("/login/", { email, password });
  const access = resp.data?.access ?? resp.data?.token ?? resp.data?.access_token;
  const refresh = resp.data?.refresh ?? resp.data?.refresh_token;
  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  }
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  return resp;
};

export const register = (email: string, username: string, password: string) => {
  return api.post("/register/", { email, username, password });
};

export const me = () => api.get("/me/");

export const logout = async () => {
  try { await api.post("/logout/"); } catch { /* ignore */ }
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  delete api.defaults.headers.common["Authorization"];
};
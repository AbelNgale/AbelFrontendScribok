import React, { useEffect, useState, ReactNode } from "react";
import api from "@/services/api";
import { me, login as apiLogin, logout as apiLogout, User } from "@/services/auth";
import { AuthContext, AuthContextType } from "./auth-context";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await me();
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const login = async (email: string, password: string) => {
    await apiLogin(email, password); // apiLogin já guarda token e define header
    const token = localStorage.getItem("accessToken");
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const res = await me();
    setUser(res.data);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const value: AuthContextType = { user, loading, login, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
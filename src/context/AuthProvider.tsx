import React, { useEffect, useState, ReactNode, useRef } from "react";
import api from "@/services/api";
import { me, login as apiLogin, logout as apiLogout, User } from "@/services/auth";
import { AuthContext, AuthContextType } from "./auth-context";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Evita executar múltiplas vezes
    if (isInitialized.current) return;
    isInitialized.current = true;

    const load = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setUser(null);
          return;
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await me();
        setUser(res.data);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        // Limpar tokens inválidos
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []); // Dependências vazias - executa apenas uma vez

  const login = async (email: string, password: string) => {
    await apiLogin(email, password);
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
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
// src/services/google-auth.ts
import api from "./api";

export interface GoogleAuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  created: boolean;
}

/**
 * Envia o token do Google para o backend Django
 * @param googleToken - Token ID recebido do Google
 * @returns Resposta com tokens JWT e dados do usuário
 */
export const googleLogin = async (googleToken: string): Promise<GoogleAuthResponse> => {
  const response = await api.post<GoogleAuthResponse>("/google/", { 
    token: googleToken 
  });
  
  // Armazena os tokens
  if (response.data.access) {
    localStorage.setItem("accessToken", response.data.access);
    api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
  }
  if (response.data.refresh) {
    localStorage.setItem("refreshToken", response.data.refresh);
  }
  
  return response.data;
};
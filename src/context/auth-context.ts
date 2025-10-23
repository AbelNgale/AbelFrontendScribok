import { createContext } from "react";
import { User } from "@/services/auth";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
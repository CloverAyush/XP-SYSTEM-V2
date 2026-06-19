"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "xp_system_token";

type AuthContextValue = {
  token: string | null;
  isReady: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    setToken(storedToken);
    setIsReady(true);
  }, []);

  function login(nextToken: string) {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    router.replace("/login");
  }

  const value = {
    token,
    isReady,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export { TOKEN_KEY };

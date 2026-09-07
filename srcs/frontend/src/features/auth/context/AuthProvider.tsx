import { useEffect, useState, type ReactNode } from "react";

import type { User } from "../types";
import { getMe, logout as logoutApi } from "../api/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    try {
      const response = await getMe();
      setCurrentUser(response.traveler);
    } catch {
      setCurrentUser(null);
    }
  }

  async function logout() {
    await logoutApi();
    setCurrentUser(null);
  }

  useEffect(() => {
    async function initializeAuth() {
      await refreshUser();
      setIsLoading(false);
    }

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { getMe, logout as logoutApi } from "../api/auth";
import { AuthContext } from "./AuthContext";

const STORAGE_KEY = "peripl-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function setCurrentUser(user: User | null) {
    setUser(user);
    saveUser(user);
  }
  async function refreshUser() {
    try {
      const response = await getMe();
      setUser(response.traveler);
      saveUser(response.traveler);
    } catch (err) {
      if (err instanceof TypeError) {
        // server offline : keep the last known user
        setUser(loadSavedUser());
      } else {
        setUser(null);
        saveUser(null);
      }
    }
  }

  async function logout() {
    await logoutApi();
    setCurrentUser(null);
    if ("caches" in window) await caches.delete("api-travels");
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

function loadSavedUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage inacessible: user wont simply be memorized
  }
}

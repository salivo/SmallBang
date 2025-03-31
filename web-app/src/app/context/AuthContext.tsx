"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import PocketBase from "pocketbase";
import { Record } from "pocketbase";

interface AuthContextType {
  pb: PocketBase;
  user: Record | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [pb] = useState(
    () => new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  );
  const [user, setUser] = useState<Record | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Při načtení stránky kontrolujeme, zda je uživatel přihlášen
    const loadAuthFromCookie = async () => {
      try {
        // PocketBase automaticky obnoví autentizaci z localStorage
        if (pb.authStore.isValid) {
          setUser(pb.authStore.model);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadAuthFromCookie();

    // Sledujeme změny autentizace
    pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
  }, [pb]);

  const login = async (email: string, password: string) => {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    setUser(authData.record);
    return authData;
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        pb,
        user,
        loading,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

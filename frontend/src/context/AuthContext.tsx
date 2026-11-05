import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { LoginRequest, User } from "../types/auth";
import { login as loginApi } from "../services/auth.api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("accessToken");

    const storedUser =
      localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser: User =
          JSON.parse(storedUser);

        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

const login = async (
    payload: LoginRequest
): Promise<User> => {
    const data = await loginApi(payload);

    localStorage.setItem(
        "accessToken",
        data.token
    );

    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);

    return data.user;
};
  const logout = (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login: call API, persist token + user, update state.
   * @returns {Object} { success: bool, error: string|null }
   */
  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return { success: true, error: null };
    } catch (err) {
      const message = err.response?.data?.detail || "Login failed";
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    try {
      await authService.register({ full_name: fullName, email, password });
      return await login(email, password);
    } catch (err) {
      const message = err.response?.data?.detail || "Registration failed";
      return { success: false, error: message };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for consuming auth context.
 * Usage: const { user, login, logout, isAuthenticated } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

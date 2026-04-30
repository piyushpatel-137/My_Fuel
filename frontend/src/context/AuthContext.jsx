import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("myfuel_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("myfuel_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("myfuel_user", JSON.stringify(data.user));
      } catch (error) {
        localStorage.removeItem("myfuel_token");
        localStorage.removeItem("myfuel_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const saveSession = (data) => {
    localStorage.setItem("myfuel_token", data.token);
    localStorage.setItem("myfuel_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    saveSession(data);
    return data;
  };

  const completeSignup = async (payload) => {
    const { data } = await api.post("/api/auth/signup/verify", payload);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("myfuel_token");
    localStorage.removeItem("myfuel_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      completeSignup,
      logout
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


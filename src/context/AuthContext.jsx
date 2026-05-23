import { createContext, useContext, useState, useEffect } from "react";
import { getMeAPI, loginAPI, registerAPI, updateProfileAPI } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    getMeAPI()
      .then((data) => {
        if (data.id) setUser(data);
        else localStorage.removeItem("token");
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const register = async (name, email, password) => {
    const data = await registerAPI({ name, email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const login = async (email, password) => {
    const data = await loginAPI({ email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  // ── UPDATE PROFILE ──
  const updateProfile = async (name, email) => {
    const data = await updateProfileAPI({ name, email });
    if (data.id) {
      setUser(data);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expenses");
    localStorage.removeItem("incomes");
    localStorage.removeItem("budgets");
    localStorage.removeItem("userSettings");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
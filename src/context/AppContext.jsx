import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRecurring } from "../hooks/useRecurring";
import { getDataAPI, saveDataAPI, updateSettingsAPI, getMeAPI } from "../services/api";

const AppContext = createContext();

const DEFAULT_SETTINGS = {
  name:          "",
  email:         "",
  currency:      "$",
  currencyCode:  "USD",
  monthlyBudget: "",
  notifications: true,
  flag:          "🇺🇸",
};

export function AppProvider({ children }) {

  const [expenses,  setExpenses]  = useState([]);
  const [incomes,   setIncomes]   = useState([]);
  const [budgets,   setBudgets]   = useState([]);
  const [settings,  setSettings]  = useState(DEFAULT_SETTINGS);
  const [search,    setSearch]    = useState("");
  const [dataReady, setDataReady] = useState(false);

  // ================= LOAD DATA + SETTINGS FROM API =================
  const loadData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setExpenses(JSON.parse(localStorage.getItem("expenses"))    || []);
      setIncomes(JSON.parse(localStorage.getItem("incomes"))      || []);
      setBudgets(JSON.parse(localStorage.getItem("budgets"))      || []);
      setSettings(JSON.parse(localStorage.getItem("userSettings")) || DEFAULT_SETTINGS);
      setDataReady(true);
      return;
    }

    try {
      // Load data and user settings in parallel
      const [data, user] = await Promise.all([
        getDataAPI(),
        getMeAPI(),
      ]);

      if (data.expenses !== undefined) {
        setExpenses(data.expenses || []);
        setIncomes(data.incomes   || []);
        setBudgets(data.budgets   || []);
      }

      // ✅ Load settings FROM DB — this fixes currency persistence
      if (user.settings) {
        setSettings((prev) => ({
          ...prev,
          ...user.settings,
          // keep name/email from user profile
          name:  user.name  || prev.name,
          email: user.email || prev.email,
        }));
      }

      setDataReady(true);
    } catch (err) {
      console.error("Failed to load data:", err);
      setDataReady(true);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ================= SAVE DATA TO API =================
  useEffect(() => {
    if (!dataReady) return;
    const token = localStorage.getItem("token");

    if (token) {
      const timer = setTimeout(() => {
        saveDataAPI({ expenses, incomes, budgets }).catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem("expenses", JSON.stringify(expenses));
      localStorage.setItem("incomes",  JSON.stringify(incomes));
      localStorage.setItem("budgets",  JSON.stringify(budgets));
    }
  }, [expenses, incomes, budgets, dataReady]);

  // ================= SAVE SETTINGS TO API =================
  useEffect(() => {
    if (!dataReady) return;
    const token = localStorage.getItem("token");

    if (token) {
      const timer = setTimeout(() => {
        // ✅ Save full settings including currency to DB
        updateSettingsAPI({
          currency:      settings.currency,
          currencyCode:  settings.currencyCode,
          monthlyBudget: settings.monthlyBudget,
          notifications: settings.notifications,
          flag:          settings.flag,
          theme:         settings.theme,
        }).catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem("userSettings", JSON.stringify(settings));
    }
  }, [settings, dataReady]);

  useRecurring(expenses, setExpenses, incomes, setIncomes);

  const fmt = (amount) => {
    return `${settings.currency}${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AppContext.Provider value={{
      expenses,  setExpenses,
      incomes,   setIncomes,
      budgets,   setBudgets,
      settings,  setSettings,
      search,    setSearch,
      currency:  settings.currency,
      fmt,
      loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
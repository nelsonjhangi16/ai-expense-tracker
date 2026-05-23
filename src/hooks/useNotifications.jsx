// hooks/useNotifications.jsx
import { useState, useEffect, useRef } from "react";

export function useNotifications(expenses = [], budgets = [], notificationsEnabled = true) {

  const [notifications, setNotifications] = useState([]);
  const seenIds = useRef(new Set());

  useEffect(() => {

    if (!notificationsEnabled) return;

    const newNotifs = [];
    const seen      = new Set();

    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    });

    // ── convert budgets array to map for easy lookup ──
    // budgets from context is an array: [{ id, category, amount }]
    const budgetMap = {};
    if (Array.isArray(budgets)) {
      budgets.forEach((b) => {
        budgetMap[b.category?.toLowerCase().trim()] = Number(b.amount);
      });
    } else {
      // fallback if old object format passed
      Object.entries(budgets).forEach(([k, v]) => {
        budgetMap[k.toLowerCase().trim()] = Number(v);
      });
    }

    expenses.forEach((exp) => {
      const catKey = exp.category?.toLowerCase().trim() || "";

      // ── large single expense ──
      const bigKey = `big-${exp.id}`;
      if (Number(exp.amount) > 500 && !seenIds.current.has(bigKey)) {
        seenIds.current.add(bigKey);
        newNotifs.push({
          id:      bigKey,
          type:    "warning",
          message: `Large expense: ${exp.category} — ${exp.amount}`,
          time:    now,
        });
      }

      // ── over budget ──
      if (budgetMap[catKey]) {
        const budgetKey = `budget-${catKey}`;
        if (!seen.has(budgetKey)) {
          seen.add(budgetKey);

          const spent = expenses
            .filter((e) => e.category?.toLowerCase().trim() === catKey)
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);

          const limit = budgetMap[catKey];

          if (spent > limit && !seenIds.current.has(budgetKey)) {
            seenIds.current.add(budgetKey);
            newNotifs.push({
              id:      budgetKey,
              type:    "danger",
              message: `Over budget on ${exp.category}: ${spent.toFixed(0)} / ${limit}`,
              time:    now,
            });
          }
        }
      }
    });

    if (newNotifs.length > 0)
      setNotifications((prev) => [...newNotifs, ...prev]);

  }, [expenses, budgets, notificationsEnabled]);

  const clearNotifications = () => {
    setNotifications([]);
    seenIds.current.clear();
  };

  return { notifications, clearNotifications };
}
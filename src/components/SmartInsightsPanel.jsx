import { useMemo } from "react";
import { TrendingUp, AlertTriangle, Info, Zap, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

function SmartInsightsPanel({ expenses = [] }) {

  const { fmt, incomes, budgets, settings } = useApp();

  // ── TOTALS ──
  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const totalIncome = useMemo(() =>
    incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0),
    [incomes]
  );

  const monthlyBudget = Number(settings.monthlyBudget || 0);

  // ── THIS MONTH ──
  const now = new Date();
  const thisMonthExpenses = useMemo(() =>
    expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }), [expenses]
  );

  const thisMonthIncome = useMemo(() =>
    incomes.filter((i) => {
      const d = new Date(i.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }), [incomes]
  );

  const thisMonthSpent  = thisMonthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisMonthEarned = thisMonthIncome.reduce((s, i) => s + Number(i.amount || 0), 0);
  const thisMonthSaved  = thisMonthEarned - thisMonthSpent;

  // ── LAST MONTH ──
  const lastMonth      = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthExpenses = useMemo(() =>
    expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    }), [expenses]
  );
  const lastMonthSpent = lastMonthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  // ── CATEGORY MAP ──
  const categoryMap = useMemo(() => {
    const map = {};
    thisMonthExpenses.forEach((e) => {
      const key = e.category || "Other";
      map[key] = (map[key] || 0) + Number(e.amount || 0);
    });
    return map;
  }, [thisMonthExpenses]);

  // ── BUDGET MAP ──
  const budgetMap = useMemo(() => {
    const map = {};
    budgets.forEach((b) => {
      map[b.category?.toLowerCase()] = Number(b.amount || 0);
    });
    return map;
  }, [budgets]);

  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  const highestExpense = useMemo(() => {
    if (!thisMonthExpenses.length) return null;
    return thisMonthExpenses.reduce((max, e) =>
      Number(e.amount) > Number(max.amount) ? e : max
    );
  }, [thisMonthExpenses]);

  // ── SMART ALERTS ──
  const alerts = useMemo(() => {
    const list = [];

    if (!expenses.length) {
      return [{ type: "info", text: "Start adding expenses to unlock AI insights" }];
    }

    const avg = thisMonthSpent / (thisMonthExpenses.length || 1);

    // 1 — savings rate
    if (thisMonthEarned > 0) {
      const savingsRate = (thisMonthSaved / thisMonthEarned) * 100;
      if (savingsRate >= 20) {
        list.push({ type: "success", text: `Great savings! You saved ${fmt(thisMonthSaved)} (${savingsRate.toFixed(0)}% of income) this month` });
      } else if (savingsRate > 0) {
        list.push({ type: "info", text: `You saved ${fmt(thisMonthSaved)} (${savingsRate.toFixed(0)}% of income) this month` });
      } else if (thisMonthSaved < 0) {
        list.push({ type: "danger", text: `Overspending! Expenses exceed income by ${fmt(Math.abs(thisMonthSaved))} this month` });
      }
    }

    // 2 — monthly budget
    if (monthlyBudget > 0) {
      const budgetUsed = (thisMonthSpent / monthlyBudget) * 100;
      if (budgetUsed >= 100) {
        list.push({ type: "danger", text: `Monthly budget exceeded! Spent ${fmt(thisMonthSpent)} of ${fmt(monthlyBudget)} budget` });
      } else if (budgetUsed >= 75) {
        list.push({ type: "warning", text: `Budget alert: Used ${budgetUsed.toFixed(0)}% of monthly budget — ${fmt(monthlyBudget - thisMonthSpent)} remaining` });
      } else if (budgetUsed > 0) {
        list.push({ type: "success", text: `Budget on track — ${fmt(monthlyBudget - thisMonthSpent)} remaining of ${fmt(monthlyBudget)}` });
      }
    }

    // 3 — category vs budget
    Object.entries(categoryMap).forEach(([cat, spent]) => {
      const budgetAmt = budgetMap[cat.toLowerCase()];
      if (budgetAmt && spent > budgetAmt) {
        list.push({ type: "warning", text: `${cat} budget exceeded — spent ${fmt(spent)} of ${fmt(budgetAmt)} budget` });
      } else if (budgetAmt && spent > budgetAmt * 0.75) {
        list.push({ type: "warning", text: `${cat} nearing budget limit — ${fmt(spent)} of ${fmt(budgetAmt)}` });
      }
    });

    // 4 — top category vs budget check
    if (topCategory) {
      const budgetAmt = budgetMap[topCategory[0].toLowerCase()];
      if (!budgetAmt) {
        list.push({ type: "info", text: `Top spending: ${topCategory[0]} — ${fmt(topCategory[1])} this month` });
      }
    }

    // 5 — vs last month
    if (lastMonthSpent > 0 && thisMonthSpent > 0) {
      const diff    = thisMonthSpent - lastMonthSpent;
      const diffPct = Math.abs((diff / lastMonthSpent) * 100).toFixed(0);
      if (diff > 0) {
        list.push({ type: "warning", text: `Spending up ${diffPct}% vs last month (${fmt(diff)} more)` });
      } else {
        list.push({ type: "success", text: `Spending down ${diffPct}% vs last month — saved ${fmt(Math.abs(diff))} more!` });
      }
    }

    // 6 — highest single expense
    if (highestExpense) {
      list.push({ type: "info", text: `Highest expense this month: "${highestExpense.title}" — ${fmt(highestExpense.amount)}` });
    }

    // 7 — no income recorded
    if (thisMonthEarned === 0 && thisMonthSpent > 0) {
      list.push({ type: "warning", text: "No income recorded this month — add income to track savings rate" });
    }

    // 8 — avg transaction
    if (avg > 0) {
      list.push({ type: "info", text: `Average expense this month: ${fmt(avg)} per transaction` });
    }

    // 9 — income vs expense ratio
    if (thisMonthEarned > 0 && thisMonthSpent > thisMonthEarned * 0.9) {
      list.push({ type: "danger", text: `Warning: Expenses are ${Math.round((thisMonthSpent / thisMonthEarned) * 100)}% of your income this month` });
    }

    // 10 — no expenses
    if (thisMonthExpenses.length === 0 && expenses.length > 0) {
      list.push({ type: "info", text: "No expenses recorded this month yet" });
    }

    return list.slice(0, 6); // max 6 insights
  }, [
    expenses, thisMonthExpenses, thisMonthSpent, thisMonthEarned,
    thisMonthSaved, lastMonthSpent, categoryMap, budgetMap,
    monthlyBudget, topCategory, highestExpense, fmt,
  ]);

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <div>
          <h3>AI Financial Insights</h3>
          <p>Smart analysis based on income, budgets & spending</p>
        </div>
        <span className="ai-badge">
          <Zap size={14} /> Live Engine
        </span>
      </div>

      <div className="ai-grid">
        {alerts.map((a, i) => (
          <div key={i} className={`ai-card ${a.type}`}>
            <div className="ai-icon">
              {a.type === "danger"  ? <AlertTriangle size={18} /> :
               a.type === "warning" ? <TrendingUp    size={18} /> :
               a.type === "success" ? <CheckCircle   size={18} /> :
                                      <Info          size={18} />}
            </div>
            <div className="ai-text">{a.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartInsightsPanel;
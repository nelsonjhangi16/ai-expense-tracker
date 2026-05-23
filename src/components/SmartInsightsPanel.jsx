import { useMemo } from "react";
import { TrendingUp, AlertTriangle, Info, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

function SmartInsightsPanel({ expenses = [] }) {

  const { fmt } = useApp();

  // ================= TOTAL =================
  const total = useMemo(() =>
    expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  // ================= CATEGORY MAP =================
  const categoryMap = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const key = e.category || "Other";
      map[key] = (map[key] || 0) + Number(e.amount || 0);
    });
    return map;
  }, [expenses]);

  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  const highestExpense = useMemo(() => {
    if (!expenses.length) return null;
    return expenses.reduce((max, e) =>
      Number(e.amount) > Number(max.amount) ? e : max
    );
  }, [expenses]);

  // ================= SMART ALERT ENGINE =================
  const alerts = useMemo(() => {
    const list = [];

    if (!expenses.length) {
      return [{ type: "info", text: "Start adding expenses to unlock AI insights" }];
    }

    const avg = total / expenses.length;

    // 1
    if (total > 100000)
      list.push({ type: "danger", text: `Extreme spending detected — ${fmt(total)} total` });

    // 2
    if (avg > 5000)
      list.push({ type: "warning", text: `Average spending is unusually high — ${fmt(avg)} per transaction` });

    // 3
    if (highestExpense)
      list.push({
        type: "info",
        text: `Highest expense: ${highestExpense.title} — ${fmt(highestExpense.amount)}`,
      });

    // 4
    if (topCategory)
      list.push({
        type: "info",
        text: `Top spending category: ${topCategory[0]} — ${fmt(topCategory[1])}`,
      });

    // 5
    const foodSpent = categoryMap["Food"] || 0;
    if (foodSpent > total * 0.4)
      list.push({
        type: "warning",
        text: `Food spending is very high — ${fmt(foodSpent)} (${Math.round((foodSpent / total) * 100)}% of total)`,
      });

    // 6
    if (expenses.length > 20)
      list.push({
        type: "info",
        text: `High transaction activity — ${expenses.length} transactions recorded`,
      });

    // 7
    const last7 = expenses.slice(-7).reduce((s, e) => s + Number(e.amount || 0), 0);
    if (last7 > total * 0.5)
      list.push({
        type: "warning",
        text: `Recent spending spike — ${fmt(last7)} in last 7 transactions`,
      });

    // 8
    const duplicateTitles = new Set();
    expenses.forEach((e) => duplicateTitles.add(e.title));
    if (duplicateTitles.size < expenses.length)
      list.push({ type: "info", text: "Repeated expense patterns found" });

    // 9
    if (total > 50000)
      list.push({
        type: "warning",
        text: `Budget threshold approaching — ${fmt(total)} spent`,
      });

    // 10
    if (avg < 1000)
      list.push({
        type: "info",
        text: `Healthy spending — ${fmt(avg)} average per transaction`,
      });

    return list;
  }, [expenses, total, categoryMap, highestExpense, topCategory, fmt]);

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <div>
          <h3>AI Financial Insights</h3>
          <p>Smart analysis of your spending behavior</p>
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
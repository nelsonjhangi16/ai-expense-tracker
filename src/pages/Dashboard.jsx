import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import SmartInsightsPanel from "../components/SmartInsightsPanel";
import EmptyState from "../components/EmptyState";
import { motion } from "framer-motion";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useTheme } from "../context/ThemeContext";

// ── CUSTOM PIE TOOLTIP ──
const PieTooltip = ({ active, payload, fmt }) => {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{
      background: "var(--card-bg)", border: "1px solid var(--border)",
      borderRadius: "12px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    }}>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 4px", fontWeight: 600, textTransform: "capitalize" }}>{name}</p>
      <p style={{ fontSize: 15, color: "var(--text)", margin: 0, fontWeight: 700 }}>{fmt(value)}</p>
    </div>
  );
};

// ── CUSTOM COMBINED TOOLTIP ──
const CombinedTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: "var(--card-bg)", border: "1px solid var(--border)",
      borderRadius: "12px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", minWidth: 160,
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{fmt(p.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Balance</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: payload[0].value - payload[1].value >= 0 ? "#22c55e" : "#ef4444" }}>
              {payload[0].value - payload[1].value >= 0 ? "+" : ""}{fmt(payload[0].value - payload[1].value)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// ── DATE FILTER OPTIONS ──
const DATE_FILTERS = [
  { key: "month", label: "This Month" },
  { key: "year",  label: "This Year"  },
  { key: "all",   label: "All Time"   },
];

// ── FILTER DATA BY DATE RANGE ──
function applyDateFilter(items, dateFilter) {
  if (dateFilter === "all") return items;
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  return items.filter((item) => {
    if (!item.date) return false;
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return false;
    if (dateFilter === "month") {
      return date.getFullYear() === year && date.getMonth() === month;
    }
    if (dateFilter === "year") {
      return date.getFullYear() === year;
    }
    return true;
  });
}

function Dashboard() {

  const { expenses, incomes, budgets, search, fmt, currency } = useApp();
  const { theme }                   = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateFilter,       setDateFilter]       = useState("month");

  // ================= DATE FILTERED DATA =================
  const dateFilteredExpenses = useMemo(() =>
    applyDateFilter(expenses, dateFilter), [expenses, dateFilter]);

  const dateFilteredIncomes = useMemo(() =>
    applyDateFilter(incomes, dateFilter), [incomes, dateFilter]);

  // ================= SEARCH + CATEGORY FILTER =================
  const filteredExpenses = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return dateFilteredExpenses
      .filter((item) => !selectedCategory || item.category === selectedCategory)
      .filter((item) => {
        if (!keyword) return true;
        return (
          item.title?.toLowerCase().includes(keyword)    ||
          item.category?.toLowerCase().includes(keyword) ||
          String(item.amount).includes(keyword)
        );
      });
  }, [dateFilteredExpenses, selectedCategory, search]);

  const hasNoData = expenses.length === 0;

  // ================= STATS =================
  const total = useMemo(() =>
    filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [filteredExpenses]
  );

  const totalIncome = useMemo(() =>
    dateFilteredIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0),
    [dateFilteredIncomes]
  );

  // ================= CATEGORY DATA =================
  const categoryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      if (!item.category) return;
      map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
    });
    return Object.keys(map).map((key) => ({ name: key, value: map[key] }));
  }, [filteredExpenses]);

  // ================= MONTHLY EXPENSES =================
const monthlyData = useMemo(() => {
  const map = {};
  filteredExpenses.forEach((item) => {
    if (!item.date) return;
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return;
    const label = dateFilter === "month"
      ? date.toLocaleString("default", { day: "numeric", month: "short" })
      : date.toLocaleString("default", { month: "short" });
    if (!map[label]) map[label] = { amount: 0, timestamp: date.getTime() };
    map[label].amount += Number(item.amount || 0);
  });

  // ── SORT OLDEST TO NEWEST (left to right = past to present) ──
  return Object.entries(map)
    .map(([key, val]) => ({ month: key, amount: val.amount, timestamp: val.timestamp }))
    .sort((a, b) => a.timestamp - b.timestamp);
}, [filteredExpenses, dateFilter]);

  // ================= COMBINED CHART DATA =================
const combinedData = useMemo(() => {
  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthMap   = {};

  dateFilteredExpenses.forEach((item) => {
    if (!item.date) return;
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return;
    const key = dateFilter === "month"
      ? date.toLocaleString("default", { day: "numeric", month: "short" })
      : date.toLocaleString("default", { month: "short" });
    if (!monthMap[key]) monthMap[key] = { month: key, Income: 0, Expenses: 0, timestamp: date.getTime() };
    monthMap[key].Expenses += Number(item.amount || 0);
  });

  dateFilteredIncomes.forEach((item) => {
    if (!item.date) return;
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return;
    const key = dateFilter === "month"
      ? date.toLocaleString("default", { day: "numeric", month: "short" })
      : date.toLocaleString("default", { month: "short" });
    if (!monthMap[key]) monthMap[key] = { month: key, Income: 0, Expenses: 0, timestamp: date.getTime() };
    monthMap[key].Income += Number(item.amount || 0);
  });

  const data = Object.values(monthMap);

  if (dateFilter === "month") {
    return data.sort((a, b) => a.timestamp - b.timestamp);
  }

  return data.sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );
}, [dateFilteredExpenses, dateFilteredIncomes, dateFilter]);

  const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#f97316","#ec4899"];

  const budgetChartData = useMemo(() => {
  const now = new Date();
  const currentMonthBudgets = budgets.filter(
    (b) => b.month === now.getMonth() && b.year === now.getFullYear()
  );
  return currentMonthBudgets.map((b) => {
    const spent = dateFilteredExpenses
      .filter((e) => e.category?.toLowerCase().trim() === b.category?.toLowerCase().trim())
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return { category: b.category, Budget: b.amount, Spent: spent };
  });
}, [dateFilteredExpenses, budgets]);

  return (
    <div className={`dashboard ${theme}`}>

      {/* ── DATE FILTER BAR ── */}
      <div className="dash-filter-bar">
        <div className="dash-filter-pills">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`dash-filter-pill ${dateFilter === f.key ? "active" : ""}`}
              onClick={() => { setDateFilter(f.key); setSelectedCategory(null); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* PERIOD SUMMARY */}
        <div className="dash-period-summary">
          <span className="dash-period-label">
            {dateFilter === "month" ? new Date().toLocaleString("default", { month: "long", year: "numeric" })
             : dateFilter === "year"  ? new Date().getFullYear()
             : "All Time"}
          </span>
          <span className="dash-period-divider" />
          <span className="dash-period-stat income">
            ↑ {fmt(totalIncome)}
          </span>
          <span className="dash-period-divider" />
          <span className="dash-period-stat expense">
            ↓ {fmt(total)}
          </span>
        </div>
      </div>

      {selectedCategory && (
        <div className="filter-bar">
          <p>Filtering: <b>{selectedCategory}</b></p>
          <button className="reset-btn" onClick={() => setSelectedCategory(null)}>
            Clear Filter
          </button>
        </div>
      )}

      {search && (
        <div className="search-info">
          Showing results for <b>"{search}"</b> — {filteredExpenses.length} found
        </div>
      )}

      {hasNoData ? (
        <EmptyState
          type="dashboard"
          title="No expenses yet"
          subtitle="Add your first expense to see analytics"
        />
      ) : (
        <>
          {/* ── STATS ── */}
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-card-header">
      <h3>Total Income</h3>
      <span className="stat-arrow income-arrow">↑</span>
    </div>
    <h2>{fmt(totalIncome)}</h2>
  </div>
  <div className="stat-card">
    <div className="stat-card-header">
      <h3>Total Expenses</h3>
      <span className="stat-arrow expense-arrow">↓</span>
    </div>
    <h2>{fmt(total)}</h2>
  </div>
  <div className="stat-card">
    <div className="stat-card-header">
      <h3>Net Balance</h3>
      <span className={`stat-arrow ${totalIncome - total >= 0 ? "income-arrow" : "expense-arrow"}`}>
        {totalIncome - total >= 0 ? "↑" : "↓"}
      </span>
    </div>
    <h2 style={{ color: totalIncome - total >= 0 ? "#22c55e" : "#ef4444" }}>
      {totalIncome - total >= 0 ? "+" : "-"}{fmt(Math.abs(totalIncome - total))}
    </h2>
  </div>
  <div className="stat-card">
    <h3>Transactions</h3>
    <h2>{filteredExpenses.length}</h2>
  </div>
  <div className="stat-card">
    <h3>Avg Expense</h3>
    <h2>{filteredExpenses.length > 0 ? fmt(total / filteredExpenses.length) : fmt(0)}</h2>
  </div>
</div>

          <div className="charts-grid">

            {/* ── PIE ── */}
            <div className="chart-card">
              <h3>Category Breakdown</h3>
              {categoryData.length === 0 ? (
                <EmptyState type="expenses" title="No data" subtitle={`No expenses in ${dateFilter === "month" ? "this month" : dateFilter === "year" ? "this year" : "any period"}`} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip content={<PieTooltip fmt={fmt} />} />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      onClick={(data) => setSelectedCategory(data.name)}
                      style={{ cursor: "pointer" }}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── MONTHLY SPENDING ── */}
            <div className="chart-card">
              <div className="monthly-chart-header">
                <div>
                  <h3>
                    {dateFilter === "month" ? "Daily Spending" : "Monthly Spending"}
                  </h3>
                  <p className="chart-sub">Spending trend over time</p>
                </div>
                {monthlyData.length > 0 && (
                  <div className="monthly-total-pill">
                    {fmt(monthlyData.reduce((s, d) => s + d.amount, 0))}
                  </div>
                )}
              </div>

              {monthlyData.length === 0 ? (
                <EmptyState type="expenses" title="No data" subtitle="No expenses in this period" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${currency}${v >= 1000 ? (v/1000).toFixed(1)+"k" : v}`}
                    />
                    <Tooltip
                      contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "10px 14px" }}
                      labelStyle={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}
                      itemStyle={{ color: "#6366f1", fontWeight: 600, fontSize: 13 }}
                      formatter={(value) => [fmt(value), "Spent"]}
                      cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5}
                      fill="url(#monthlyGrad)"
                      dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "var(--card-bg)" }}
                      activeDot={{ r: 6, fill: "#6366f1", stroke: "var(--card-bg)", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>

          {/* ── COMBINED INCOME VS EXPENSES ── */}
          {/* ── COMBINED INCOME VS EXPENSES ── */}
<div className="chart-card" style={{ marginTop: 10 }}>
  <div className="monthly-chart-header">
    <div>
      <h3>Income vs Expenses</h3>
      <p className="chart-sub">
        {dateFilter === "month" ? "Daily comparison" : "Monthly comparison"}
      </p>
    </div>
    {combinedData.length > 0 && (
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          {fmt(dateFilteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0))}
        </span>
        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          {fmt(dateFilteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0))}
        </span>
      </div>
    )}
  </div>

  {combinedData.length === 0 ? (
    <EmptyState type="dashboard" title="No data" subtitle="No income or expenses in this period" />
  ) : combinedData.length === 1 ? (
    /* ── SINGLE ENTRY — show bar chart instead ── */
    <div style={{ padding: "20px 0" }}>
      {combinedData.map((d) => (
        <div key={d.month} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12, textAlign: "center" }}>{d.month}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", padding: "16px 24px", borderRadius: 16, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, margin: "0 0 6px" }}>💰 Income</p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#22c55e", margin: 0 }}>{fmt(d.Income)}</h3>
            </div>
            <div style={{ textAlign: "center", padding: "16px 24px", borderRadius: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, margin: "0 0 6px" }}>💸 Expenses</p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#ef4444", margin: 0 }}>{fmt(d.Expenses)}</h3>
            </div>
            <div style={{ textAlign: "center", padding: "16px 24px", borderRadius: 16,
              background: d.Income - d.Expenses >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${d.Income - d.Expenses >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
              <p style={{ fontSize: 12, color: d.Income - d.Expenses >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, margin: "0 0 6px" }}>
                {d.Income - d.Expenses >= 0 ? "✅ Saved" : "⚠️ Deficit"}
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: d.Income - d.Expenses >= 0 ? "#22c55e" : "#ef4444", margin: 0 }}>
                {fmt(Math.abs(d.Income - d.Expenses))}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGradDB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="expenseGradDB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `${currency}${v >= 1000 ? (v/1000).toFixed(1)+"k" : v}`}
        />
        <Tooltip content={<CombinedTooltip fmt={fmt} />} />
        <Area type="monotone" dataKey="Income"   stroke="#22c55e" strokeWidth={2.5} fill="url(#incomeGradDB)"
          dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "var(--card-bg)" }}
          activeDot={{ r: 6, fill: "#22c55e", stroke: "var(--card-bg)", strokeWidth: 2 }}
        />
        <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGradDB)"
          dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "var(--card-bg)" }}
          activeDot={{ r: 6, fill: "#ef4444", stroke: "var(--card-bg)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )}
</div>

          {/* ── BUDGET vs EXPENSES ── */}
          <div className="chart-card budget-chart">
            <div className="chart-header">
              <div>
                <h3>Budget vs Expenses</h3>
                <p>Real-time spending vs allocated budget</p>
              </div>
              {budgetChartData.length > 0 && (
                <div className="chart-summary">
                  <div>
                    <span>Total Budget</span>
                    <b>{fmt(budgetChartData.reduce((s, b) => s + Number(b.Budget || 0), 0))}</b>
                  </div>
                  <div>
                    <span>Total Spent</span>
                    <b>{fmt(budgetChartData.reduce((s, b) => s + Number(b.Spent || 0), 0))}</b>
                  </div>
                </div>
              )}
            </div>

            {budgetChartData.length === 0 ? (
              <EmptyState type="budgets" title="No budgets set yet" subtitle="Add budgets on the Budgets page to see comparison" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={budgetChartData} barGap={6} barCategoryGap="20%">
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${currency}${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                    formatter={(v) => [fmt(v)]}
                  />
                  <Legend />
                  <Bar dataKey="Budget" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Spent"  fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <SmartInsightsPanel expenses={filteredExpenses} />
        </>
      )}
    </div>
  );
}

export default Dashboard;
import { useEffect, useState, useMemo } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { useApp }      from "../context/AppContext";
import EmptyState      from "../components/EmptyState";
import ConfirmModal    from "../components/ConfirmModal";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Budgets({ toast }) {

  const { expenses, budgets, setBudgets, search, fmt } = useApp();

  const now = new Date();

  const [category,   setCategory]   = useState("");
  const [amount,     setAmount]     = useState("");
  const [editingId,  setEditingId]  = useState(null);
  const [editAmount, setEditAmount] = useState("");

  // ── SELECTED MONTH/YEAR (default current) ──
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear,  setViewYear]  = useState(now.getFullYear());

  // ── CONFIRM MODAL ──
  const [confirmOpen,       setConfirmOpen]       = useState(false);
  const [pendingDeleteId,   setPendingDeleteId]   = useState(null);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
  const isFutureMonth  = (viewYear > now.getFullYear()) ||
    (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  // ================= MIGRATE OLD BUDGETS (no month/year) =================
  useEffect(() => {
    const needsMigration = budgets.some((b) => b.month === undefined || b.year === undefined);
    if (needsMigration) {
      setBudgets(budgets.map((b) =>
        (b.month === undefined || b.year === undefined)
          ? { ...b, month: now.getMonth(), year: now.getFullYear() }
          : b
      ));
    }
  }, []); // eslint-disable-line

  // ================= ADD =================
  const addBudget = () => {
    if (!category || !amount) return;
    const exists = budgets.find(
      (b) => b.category.toLowerCase().trim() === category.toLowerCase().trim()
        && b.month === viewMonth && b.year === viewYear
    );
    if (exists) {
      toast?.({ message: `⚠️ Budget already exists for "${category}" in ${MONTH_NAMES[viewMonth]}`, type: "warning" });
      return;
    }
    const formattedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1);
    setBudgets([...budgets, {
      id: Date.now(), category: formattedCategory, amount: Number(amount),
      month: viewMonth, year: viewYear,
    }]);
    toast?.({ message: `✅ Budget added for "${formattedCategory}" — ${MONTH_NAMES[viewMonth]} ${viewYear}`, type: "success" });
    setCategory("");
    setAmount("");
  };

  // ================= COPY FROM PREVIOUS MONTH =================
  const copyFromPreviousMonth = () => {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear  = viewMonth === 0 ? viewYear - 1 : viewYear;

    const prevBudgets = budgets.filter((b) => b.month === prevMonth && b.year === prevYear);
    if (prevBudgets.length === 0) {
      toast?.({ message: `No budgets found for ${MONTH_NAMES[prevMonth]} to copy`, type: "warning" });
      return;
    }

    const newBudgets = prevBudgets
      .filter((pb) => !budgets.some((b) => b.month === viewMonth && b.year === viewYear
        && b.category.toLowerCase() === pb.category.toLowerCase()))
      .map((pb) => ({
        id: Date.now() + Math.random(),
        category: pb.category, amount: pb.amount,
        month: viewMonth, year: viewYear,
      }));

    if (newBudgets.length === 0) {
      toast?.({ message: "All categories already have budgets this month", type: "info" });
      return;
    }

    setBudgets([...budgets, ...newBudgets]);
    toast?.({ message: `✅ Copied ${newBudgets.length} budget${newBudgets.length > 1 ? "s" : ""} from ${MONTH_NAMES[prevMonth]}`, type: "success" });
  };

  // ================= DELETE =================
  const askDelete = (budget) => {
    setPendingDeleteId(budget.id);
    setPendingDeleteName(budget.category);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    setBudgets(budgets.filter((b) => b.id !== pendingDeleteId));
    toast?.({ message: `🗑 "${pendingDeleteName}" budget deleted`, type: "error" });
    setConfirmOpen(false);
    setPendingDeleteId(null);
    setPendingDeleteName("");
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
    setPendingDeleteName("");
  };

  // ================= EDIT =================
  const startEdit = (budget) => { setEditingId(budget.id); setEditAmount(budget.amount); };

  const saveEdit = (id) => {
    setBudgets(budgets.map((b) => b.id === id ? { ...b, amount: Number(editAmount) } : b));
    setEditingId(null);
    toast?.({ message: "✏️ Budget updated", type: "info" });
  };

  // ================= CURRENT MONTH BUDGETS =================
  const monthBudgets = useMemo(() =>
    budgets.filter((b) => b.month === viewMonth && b.year === viewYear),
    [budgets, viewMonth, viewYear]
  );

  // ================= FILTER (search) =================
  const filteredBudgets = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return monthBudgets;
    return monthBudgets.filter((b) => b.category.toLowerCase().includes(keyword));
  }, [monthBudgets, search]);

  // ================= EXPENSES FOR THIS MONTH =================
  const monthExpenses = useMemo(() =>
    expenses.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    }), [expenses, viewMonth, viewYear]
  );

  // ================= SPENT HELPER ================
  const getSpent = (budgetCategory) =>
    monthExpenses
      .filter((e) => e.category?.toLowerCase().trim() === budgetCategory?.toLowerCase().trim())
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // ================= NOTIFICATIONS — budget thresholds ================
  useEffect(() => {
    if (!isCurrentMonth) return; // only alert for current month
    const existing = JSON.parse(localStorage.getItem("notifications")) || [];
    const updated  = [...existing];
    monthBudgets.forEach((budget) => {
      const spent = getSpent(budget.category);
      const pct = (spent / budget.amount) * 100;
      [
        { level: 50,  type: "info",    emoji: "📈" },
        { level: 75,  type: "warning", emoji: "⚠️" },
        { level: 100, type: "danger",  emoji: "🚨" },
      ].forEach(({ level, type, emoji }) => {
        if (pct < level) return;
        const key = `${budget.category}-${viewMonth}-${viewYear}-${level}`;
        const alreadyExists = updated.find((n) => n.key === key);
        if (!alreadyExists) {
          updated.unshift({
            id: Date.now() + Math.random(),
            key, category: budget.category, level, type,
            message: level >= 100
              ? `${emoji} ${budget.category} budget exceeded! (${fmt(spent)} of ${fmt(budget.amount)})`
              : `${emoji} ${budget.category} reached ${level}% of budget (${fmt(spent)} of ${fmt(budget.amount)})`,
            time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          });
        }
      });
    });
    localStorage.setItem("notifications", JSON.stringify(updated));
  }, [monthBudgets, monthExpenses]);

  // ================= NEW MONTH DETECTION + SAVINGS NOTIFICATION ================
  useEffect(() => {
    const lastChecked = localStorage.getItem("lastBudgetMonthCheck");
    const currentKey  = `${now.getFullYear()}-${now.getMonth()}`;

    if (lastChecked === currentKey) return; // already checked this month

    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const prevBudgets = budgets.filter((b) => b.month === prevMonth && b.year === prevYear);
    const currBudgets = budgets.filter((b) => b.month === now.getMonth() && b.year === now.getFullYear());

    if (prevBudgets.length > 0) {
      // Calculate last month's total savings
      const prevExpenses = expenses.filter((e) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });

      let totalBudget = 0, totalSpent = 0;
      prevBudgets.forEach((b) => {
        totalBudget += Number(b.amount || 0);
        totalSpent  += prevExpenses
          .filter((e) => e.category?.toLowerCase().trim() === b.category?.toLowerCase().trim())
          .reduce((s, e) => s + Number(e.amount || 0), 0);
      });

      const saved = totalBudget - totalSpent;

      const existing = JSON.parse(localStorage.getItem("notifications")) || [];
      const updated  = [...existing];

      if (saved > 0) {
        updated.unshift({
          id: Date.now() + Math.random(),
          key: `month-saved-${prevYear}-${prevMonth}`,
          category: "Monthly Summary", level: 0, type: "info",
          message: `🎉 You saved ${fmt(saved)} in ${MONTH_NAMES[prevMonth]}! Great budgeting.`,
          time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        });
      } else if (saved < 0) {
        updated.unshift({
          id: Date.now() + Math.random(),
          key: `month-over-${prevYear}-${prevMonth}`,
          category: "Monthly Summary", level: 0, type: "warning",
          message: `⚠️ You went over budget by ${fmt(Math.abs(saved))} in ${MONTH_NAMES[prevMonth]}`,
          time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        });
      }

      if (currBudgets.length === 0) {
        updated.unshift({
          id: Date.now() + Math.random(),
          key: `new-month-budget-${now.getFullYear()}-${now.getMonth()}`,
          category: "Monthly Summary", level: 0, type: "info",
          message: `📅 New month started! Set up your budgets for ${MONTH_NAMES[now.getMonth()]}.`,
          time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        });
      }

      localStorage.setItem("notifications", JSON.stringify(updated));
    }

    localStorage.setItem("lastBudgetMonthCheck", currentKey);
  }, [budgets, expenses]);

  // ================= INSIGHTS =================
  const insights = useMemo(() => {
    if (monthBudgets.length === 0) return [];
    return monthBudgets.map((budget) => {
      const spent = getSpent(budget.category);
      const pct = (spent / budget.amount) * 100;
      if (pct >= 100) return { icon: "🚨", title: "Budget Exceeded",    message: `${budget.category} exceeded the budget for ${MONTH_NAMES[viewMonth]}` };
      if (pct >= 75)  return { icon: "⚠️", title: "Critical Spending",  message: `${budget.category} reached ${pct.toFixed(0)}% of budget` };
      if (pct >= 50)  return { icon: "📈", title: "Spending Increasing", message: `${budget.category} spending is growing quickly` };
      return              { icon: "📊", title: "Healthy Budget",      message: `${budget.category} spending is under control` };
    });
  }, [monthBudgets, monthExpenses]);

  // ================= NAVIGATION =================
  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const goCurrentMonth = () => {
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  };

  return (
    <div className="budgets-page">

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Budget"
        message="Are you sure you want to delete the budget for"
        itemName={pendingDeleteName}
      />

      <div className="budget-header">
        <div><h1>Budget Planner</h1><p>Set and track category-based monthly budgets</p></div>
      </div>

      {/* ── MONTH SELECTOR ── */}
      <div className="budget-month-selector">
        <button className="bud-month-nav" onClick={goPrevMonth}><ChevronLeft size={16} /></button>
        <div className="bud-month-label">
          <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
          {!isCurrentMonth && (
            <button className="bud-back-current" onClick={goCurrentMonth}>
              {isFutureMonth ? "← Back to current" : "Jump to current →"}
            </button>
          )}
          {isCurrentMonth && <span className="bud-current-tag">Current Month</span>}
        </div>
        <button className="bud-month-nav" onClick={goNextMonth}><ChevronRight size={16} /></button>
      </div>

      <div className="budget-top-section">
        <div className="budget-form-card">
          <h3>Create Budget — {MONTH_NAMES[viewMonth]} {viewYear}</h3>
          <div className="budget-form">
            <input type="text"   placeholder="Category (e.g. Food, Transport)" value={category} onChange={(e) => setCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBudget()} />
            <input type="number" placeholder="Budget Amount"                    value={amount}   onChange={(e) => setAmount(e.target.value)}   onKeyDown={(e) => e.key === "Enter" && addBudget()} />
            <button onClick={addBudget}>Add Budget</button>
          </div>
          <button className="bud-copy-btn" onClick={copyFromPreviousMonth}>
            <Copy size={13} /> Copy budgets from previous month
          </button>
        </div>
        <div className="budget-summary">
          <p>{MONTH_NAMES[viewMonth]} Budget Overview</p>
          <h2>{fmt(monthBudgets.reduce((s, b) => s + Number(b.amount), 0))}</h2>
          <p>Across {monthBudgets.length} {monthBudgets.length === 1 ? "category" : "categories"}</p>
        </div>
      </div>

      {search && (
        <div className="search-info">
          Showing results for <b>"{search}"</b> — {filteredBudgets.length} budget{filteredBudgets.length !== 1 ? "s" : ""} found
        </div>
      )}

      {filteredBudgets.length === 0 ? (
        <EmptyState
          type={search ? "search" : "budgets"}
          title={search ? "No results found" : `No budgets set for ${MONTH_NAMES[viewMonth]}`}
          subtitle={search ? `No categories matched "${search}"` : "Create a budget above, or copy from previous month"}
        />
      ) : (
        <div className="budgets-grid">
          {filteredBudgets.map((budget) => {
            const spent  = getSpent(budget.category);
            const pct    = Math.min((spent / budget.amount) * 100, 100);
            const remain = Math.max(budget.amount - spent, 0);
            const over   = spent > budget.amount;
            const statusColor  = pct >= 100 ? "#ef4444" : pct >= 75 ? "#f59e0b" : "#22c55e";
            const barGradient  = pct >= 100 ? "linear-gradient(90deg,#ef4444,#dc2626)" : pct >= 75 ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#22c55e,#16a34a)";
            const statusLabel  = pct >= 100 ? "Exceeded" : pct >= 75 ? "Critical" : pct >= 50 ? "Moderate" : "Healthy";

            return (
              <div className="budget-card" key={budget.id}>
                <div className="bud-card-top">
                  <div className="bud-card-icon">{budget.category.charAt(0).toUpperCase()}</div>
                  <div className="bud-card-info">
                    <h3>{budget.category}</h3>
                    <span className="bud-status-badge" style={{ background: `${statusColor}18`, color: statusColor }}>{statusLabel}</span>
                  </div>
                  <div className="bud-card-actions">
                    <button className="bud-action-btn edit"   onClick={() => startEdit(budget)} title="Edit"><Pencil size={13} /></button>
                    <button className="bud-action-btn delete" onClick={() => askDelete(budget)}  title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="bud-card-amounts">
                  <div className="bud-card-pct" style={{ color: statusColor }}>{pct.toFixed(0)}%</div>
                  <div className="bud-card-figures">
                    <span>{fmt(spent)} <small>spent</small></span>
                    <span className="bud-slash">/</span>
                    <span>{fmt(budget.amount)} <small>budget</small></span>
                  </div>
                </div>
                <div className="bud-progress-wrap">
                  <div className="bud-progress-fill" style={{ width: `${pct}%`, background: barGradient }} />
                </div>
                <div className="bud-card-footer">
                  {over
                    ? <span className="bud-over-tag">⚠️ Over by {fmt(spent - budget.amount)}</span>
                    : <span className="bud-remain-tag">{fmt(remain)} remaining</span>}
                </div>
                {editingId === budget.id && (
                  <div className="bud-edit-box">
                    <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="New amount" />
                    <div className="bud-edit-actions">
                      <button className="exp-save-btn"   onClick={() => saveEdit(budget.id)}>Save</button>
                      <button className="exp-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {insights.length > 0 && (
        <div className="finance-ai-panel">
          <div className="finance-ai-header">
            <div><h2>AI Financial Insights</h2><p>Smart analysis for {MONTH_NAMES[viewMonth]} {viewYear}</p></div>
            <div className="ai-live-badge">LIVE ANALYSIS</div>
          </div>
          <div className="finance-ai-grid">
            {insights.map((item, i) => (
              <div className="finance-ai-card" key={i}>
                <div className="finance-ai-icon">{item.icon}</div>
                <div className="finance-ai-content"><h4>{item.title}</h4><p>{item.message}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;
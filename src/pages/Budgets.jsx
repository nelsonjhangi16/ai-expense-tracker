import { useEffect, useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useApp }      from "../context/AppContext";
import EmptyState      from "../components/EmptyState";
import ConfirmModal    from "../components/ConfirmModal";

function Budgets({ toast }) {

  const { expenses, budgets, setBudgets, search, fmt } = useApp();

  const [category,   setCategory]   = useState("");
  const [amount,     setAmount]     = useState("");
  const [editingId,  setEditingId]  = useState(null);
  const [editAmount, setEditAmount] = useState("");

  // ── CONFIRM MODAL ──
  const [confirmOpen,       setConfirmOpen]       = useState(false);
  const [pendingDeleteId,   setPendingDeleteId]   = useState(null);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  // ================= ADD =================
  const addBudget = () => {
    if (!category || !amount) return;
    const exists = budgets.find(
      (b) => b.category.toLowerCase().trim() === category.toLowerCase().trim()
    );
    if (exists) {
      toast?.({ message: `⚠️ Budget already exists for "${category}"`, type: "warning" });
      return;
    }
    const formattedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1);
    setBudgets([...budgets, { id: Date.now(), category: formattedCategory, amount: Number(amount) }]);
    toast?.({ message: `✅ Budget added for "${formattedCategory}"`, type: "success" });
    setCategory("");
    setAmount("");
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

  // ================= FILTER =================
  const filteredBudgets = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return budgets;
    return budgets.filter((b) => b.category.toLowerCase().includes(keyword));
  }, [budgets, search]);

  // ================= NOTIFICATIONS =================
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("notifications")) || [];
    const updated  = [...existing];
    budgets.forEach((budget) => {
      const spent = expenses
        .filter((e) => e.category?.toLowerCase().trim() === budget.category?.toLowerCase().trim())
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const pct = (spent / budget.amount) * 100;
      [
        { level: 50,  type: "info",    emoji: "📈" },
        { level: 75,  type: "warning", emoji: "⚠️" },
        { level: 100, type: "danger",  emoji: "🚨" },
      ].forEach(({ level, type, emoji }) => {
        if (pct < level) return;
        const alreadyExists = updated.find((n) => n.category === budget.category && n.level === level);
        if (!alreadyExists) {
          updated.unshift({
            id: Date.now() + Math.random(),
            category: budget.category, level, type,
            message: level >= 100
              ? `${emoji} ${budget.category} budget exceeded! (${fmt(spent)} of ${fmt(budget.amount)})`
              : `${emoji} ${budget.category} reached ${level}% of budget (${fmt(spent)} of ${fmt(budget.amount)})`,
            time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          });
        }
      });
    });
    localStorage.setItem("notifications", JSON.stringify(updated));
  }, [budgets, expenses]);

  // ================= INSIGHTS =================
  const insights = useMemo(() => {
    if (budgets.length === 0) return [];
    return budgets.map((budget) => {
      const spent = expenses
        .filter((e) => e.category?.toLowerCase().trim() === budget.category?.toLowerCase().trim())
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const pct = (spent / budget.amount) * 100;
      if (pct >= 100) return { icon: "🚨", title: "Budget Exceeded",    message: `${budget.category} exceeded the monthly budget` };
      if (pct >= 75)  return { icon: "⚠️", title: "Critical Spending",  message: `${budget.category} reached ${pct.toFixed(0)}% of budget` };
      if (pct >= 50)  return { icon: "📈", title: "Spending Increasing", message: `${budget.category} spending is growing quickly` };
      return              { icon: "📊", title: "Healthy Budget",      message: `${budget.category} spending is under control` };
    });
  }, [budgets, expenses]);

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

      <div className="budget-top-section">
        <div className="budget-form-card">
          <h3>Create Budget</h3>
          <div className="budget-form">
            <input type="text"   placeholder="Category (e.g. Food, Transport)" value={category} onChange={(e) => setCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBudget()} />
            <input type="number" placeholder="Budget Amount"                    value={amount}   onChange={(e) => setAmount(e.target.value)}   onKeyDown={(e) => e.key === "Enter" && addBudget()} />
            <button onClick={addBudget}>Add Budget</button>
          </div>
        </div>
        <div className="budget-summary">
          <p>Total Budget Overview</p>
          <h2>{fmt(budgets.reduce((s, b) => s + Number(b.amount), 0))}</h2>
          <p>Across {budgets.length} {budgets.length === 1 ? "category" : "categories"}</p>
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
          title={search ? "No results found" : "No budgets set"}
          subtitle={search ? `No categories matched "${search}"` : "Create a budget above to start tracking"}
        />
      ) : (
        <div className="budgets-grid">
          {filteredBudgets.map((budget) => {
            const spent  = expenses
              .filter((e) => e.category?.toLowerCase().trim() === budget.category?.toLowerCase().trim())
              .reduce((sum, e) => sum + Number(e.amount || 0), 0);
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
            <div><h2>AI Financial Insights</h2><p>Smart analysis of your budgeting behavior</p></div>
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
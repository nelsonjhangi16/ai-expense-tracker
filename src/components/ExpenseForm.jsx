import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { categorizeExpense } from "../utils/categorizeExpense";
import { useApp } from "../context/AppContext";

function ExpenseForm({ addExpense }) {
  const { expenses } = useApp();

  // ── LIVE CURRENT DATE TIME ──
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    title:     "",
    category:  "",
    amount:    "",
    date:      getCurrentDateTime(),
    recurring: "none",
  });

  // ── UPDATE DATE EVERY MINUTE IF USER HASN'T CHANGED IT ──
  useEffect(() => {
    const interval = setInterval(() => {
      setForm((prev) => {
        // Only auto-update if date is close to current time
        const prevDate  = new Date(prev.date).getTime();
        const nowTime   = new Date().getTime();
        const diffMins  = Math.abs(nowTime - prevDate) / 60000;
        if (diffMins < 2) {
          return { ...prev, date: getCurrentDateTime() };
        }
        return prev;
      });
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ── BLOCK FUTURE DATES ──
    if (name === "date") {
      const selected = new Date(value).getTime();
      const now      = new Date().getTime();
      if (selected > now) return; // block future
    }

    let updatedForm = { ...form, [name]: value };

    // AI AUTO CATEGORY — learns from your past expenses
    if (name === "title") {
      updatedForm.category = categorizeExpense(value, expenses);
    }

    setForm(updatedForm);
  };

  const handleSubmit = () => {
    if (!form.title || !form.amount) return;

    const aiCategory = categorizeExpense(form.title, expenses);

    addExpense({
      title:       form.title,
      amount:      form.amount,
      category:    form.category || aiCategory,
      aiGenerated: !form.category,
      date:        form.date || new Date().toISOString(),
      recurring:   form.recurring,
    });

    setForm({
      title:     "",
      category:  "",
      amount:    "",
      date:      getCurrentDateTime(),
      recurring: "none",
    });
  };

  return (
    <div className="expense-form-card">
      <h3>Add New Expense</h3>
      <p>Track your spending in real-time</p>

      <div className="form-grid">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category (auto-detected)"
          value={form.category}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="date"
          value={form.date}
          max={getCurrentDateTime()}
          onChange={handleChange}
        />
      </div>

      {/* RECURRING */}
      <div className="form-recurring-row">
        <label className="form-recurring-label">Recurrence</label>
        <select
          name="recurring"
          className="form-recurring-select"
          value={form.recurring}
          onChange={handleChange}
        >
          <option value="none">No Recurrence</option>
          <option value="weekly">🔁 Weekly</option>
          <option value="monthly">🔁 Monthly</option>
        </select>
      </div>

      <button className="add-btn" onClick={handleSubmit}>
        <FaPlus /> Add Expense
      </button>
    </div>
  );
}

export default ExpenseForm;
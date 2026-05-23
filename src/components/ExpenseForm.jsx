import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { categorizeExpense } from "../utils/categorizeExpense";

function ExpenseForm({ addExpense }) {

  const getCurrentDateTime = () => new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    title:     "",
    category:  "",
    amount:    "",
    date:      getCurrentDateTime(),
    recurring: "none",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = { ...form, [name]: value };

    // AI AUTO CATEGORY
    if (name === "title") {
      updatedForm.category = categorizeExpense(value);
    }

    setForm(updatedForm);
  };

  const handleSubmit = () => {
    if (!form.title || !form.amount) return;

    const aiCategory = categorizeExpense(form.title);

    addExpense({
      title:        form.title,
      amount:       form.amount,
      category:     form.category || aiCategory,
      aiGenerated:  !form.category,
      date:         form.date || new Date().toISOString(),
      recurring:    form.recurring,
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
          placeholder="Category"
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
import { useState } from "react";
import { Calendar, X } from "lucide-react";

function DateRangeFilter({ onApply, onClear, active }) {
  const [from, setFrom] = useState("");
  const [to,   setTo]   = useState("");
  const [open, setOpen] = useState(false);

  const apply = () => {
    if (!from && !to) return;
    onApply({ from, to });
    setOpen(false);
  };

  const clear = () => {
    setFrom("");
    setTo("");
    onClear();
    setOpen(false);
  };

  return (
    <div className="drf-wrap">

      <button
        className={`drf-trigger ${active ? "active" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <Calendar size={13} />
        {active ? "Date Filter Active" : "Date Range"}
        {active && (
          <span
            className="drf-clear-x"
            onClick={(e) => { e.stopPropagation(); clear(); }}
          >
            <X size={11} />
          </span>
        )}
      </button>

      {open && (
        <div className="drf-panel">
          <p className="drf-label">From</p>
          <input
            type="date"
            className="drf-input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />

          <p className="drf-label">To</p>
          <input
            type="date"
            className="drf-input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />

          <div className="drf-actions">
            <button className="drf-clear-btn" onClick={clear}>Clear</button>
            <button className="drf-apply-btn" onClick={apply}>Apply</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default DateRangeFilter;
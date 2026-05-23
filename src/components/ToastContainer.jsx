import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

const CONFIG = {
  success: {
    icon:    <CheckCircle  size={18} />,
    color:   "#22c55e",
    bg:      "rgba(34,197,94,0.1)",
    border:  "rgba(34,197,94,0.25)",
    label:   "Success",
  },
  error: {
    icon:    <XCircle      size={18} />,
    color:   "#ef4444",
    bg:      "rgba(239,68,68,0.1)",
    border:  "rgba(239,68,68,0.25)",
    label:   "Error",
  },
  warning: {
    icon:    <AlertTriangle size={18} />,
    color:   "#f59e0b",
    bg:      "rgba(245,158,11,0.1)",
    border:  "rgba(245,158,11,0.25)",
    label:   "Warning",
  },
  info: {
    icon:    <Info          size={18} />,
    color:   "#6366f1",
    bg:      "rgba(99,102,241,0.1)",
    border:  "rgba(99,102,241,0.25)",
    label:   "Info",
  },
};

function Toast({ t, removeToast }) {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[t.type] || CONFIG.info;

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(show);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => removeToast(t.id), 300);
  };

  return (
    <div
      className="toast-item"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* PROGRESS BAR */}
      <div
        className="toast-progress"
        style={{ background: cfg.color }}
      />

      {/* ICON */}
      <div
        className="toast-icon-wrap"
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      >
        {cfg.icon}
      </div>

      {/* CONTENT */}
      <div className="toast-body">
        <span className="toast-label" style={{ color: cfg.color }}>{cfg.label}</span>
        <p className="toast-message">{t.message}</p>
      </div>

      {/* CLOSE */}
      <button className="toast-close-btn" onClick={handleClose}>
        <X size={14} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} t={t} removeToast={removeToast} />
      ))}
    </div>
  );
}

export default ToastContainer;
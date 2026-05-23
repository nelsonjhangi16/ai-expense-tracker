import { Trash2, X } from "lucide-react";

function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-icon">
          <Trash2 size={22} />
        </div>

        <div className="modal-content">
          <h3>{title || "Confirm Delete"}</h3>
          <p>
            {message || "Are you sure you want to delete"}
            {itemName && <> <b>"{itemName}"</b></>}?
            <br />
            <span>This action cannot be undone.</span>
          </p>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onCancel}>
            <X size={14} /> Cancel
          </button>
          <button className="modal-confirm-btn" onClick={onConfirm}>
            <Trash2 size={14} /> Delete
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;
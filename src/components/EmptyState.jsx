// components/EmptyState.jsx

const ILLUSTRATIONS = {

  expenses: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="40" width="140" height="90" rx="12" fill="currentColor" opacity="0.06"/>
      <rect x="45" y="55" width="80" height="10" rx="5" fill="currentColor" opacity="0.15"/>
      <rect x="45" y="73" width="55" height="8" rx="4" fill="currentColor" opacity="0.1"/>
      <rect x="45" y="89" width="65" height="8" rx="4" fill="currentColor" opacity="0.1"/>
      <rect x="45" y="105" width="40" height="8" rx="4" fill="currentColor" opacity="0.08"/>
      <circle cx="148" cy="72" r="14" fill="currentColor" opacity="0.08"/>
      <path d="M143 72h10M148 67v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      <circle cx="100" cy="130" r="4" fill="currentColor" opacity="0.15"/>
      <circle cx="112" cy="130" r="4" fill="currentColor" opacity="0.1"/>
      <circle cx="88" cy="130" r="4" fill="currentColor" opacity="0.1"/>
    </svg>
  ),

  income: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="50" width="150" height="80" rx="14" fill="currentColor" opacity="0.06"/>
      <path d="M50 110 L75 85 L100 95 L130 65 L155 75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
      <circle cx="50"  cy="110" r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="75"  cy="85"  r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="100" cy="95"  r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="130" cy="65"  r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="155" cy="75"  r="4" fill="currentColor" opacity="0.2"/>
      <path d="M140 40 L155 55 M155 40 L155 55 L140 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25"/>
    </svg>
  ),

  budgets: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30"  y="100" width="28" height="40" rx="5" fill="currentColor" opacity="0.12"/>
      <rect x="68"  y="75"  width="28" height="65" rx="5" fill="currentColor" opacity="0.1"/>
      <rect x="106" y="55"  width="28" height="85" rx="5" fill="currentColor" opacity="0.08"/>
      <rect x="144" y="80"  width="28" height="60" rx="5" fill="currentColor" opacity="0.1"/>
      <line x1="25" y1="145" x2="175" y2="145" stroke="currentColor" strokeWidth="1.5" opacity="0.1" strokeLinecap="round"/>
      <path d="M44 90 L82 68 L120 50 L158 72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" opacity="0.2"/>
    </svg>
  ),

  dashboard: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25"  y="30"  width="65" height="55" rx="10" fill="currentColor" opacity="0.07"/>
      <rect x="100" y="30"  width="75" height="25" rx="8"  fill="currentColor" opacity="0.07"/>
      <rect x="100" y="62"  width="75" height="23" rx="8"  fill="currentColor" opacity="0.05"/>
      <rect x="25"  y="95"  width="150" height="38" rx="10" fill="currentColor" opacity="0.05"/>
      <circle cx="57"  cy="57"  r="18" stroke="currentColor" strokeWidth="2" opacity="0.12"/>
      <path d="M57 57 L57 39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
      <path d="M57 57 L70 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.15"/>
      <rect x="110" y="40" width="45" height="5" rx="2.5" fill="currentColor" opacity="0.12"/>
      <rect x="110" y="50" width="30" height="4" rx="2"   fill="currentColor" opacity="0.08"/>
      <rect x="110" y="70" width="50" height="5" rx="2.5" fill="currentColor" opacity="0.1"/>
      <rect x="110" y="80" width="35" height="4" rx="2"   fill="currentColor" opacity="0.07"/>
      <rect x="35"  y="105" width="60" height="5" rx="2.5" fill="currentColor" opacity="0.1"/>
      <rect x="35"  y="115" width="40" height="4" rx="2"   fill="currentColor" opacity="0.07"/>
    </svg>
  ),

  search: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="72" r="35" stroke="currentColor" strokeWidth="2.5" opacity="0.15"/>
      <line x1="113" y1="97" x2="145" y2="129" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.15"/>
      <circle cx="88" cy="72" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.1"/>
      <path d="M78 72 L88 62 L98 72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
      <path d="M88 62 L88 82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
    </svg>
  ),
};

function EmptyState({ type = "expenses", title, subtitle, action, actionLabel }) {
  const illustration = ILLUSTRATIONS[type] || ILLUSTRATIONS.expenses;

  return (
    <div className="empty-state">

      <div className="empty-state-illustration">
        {illustration}
      </div>

      <div className="empty-state-text">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {action && actionLabel && (
        <button className="empty-state-btn" onClick={action}>
          {actionLabel}
        </button>
      )}

    </div>
  );
}

export default EmptyState;
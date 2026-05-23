import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Wallet, PiggyBank,
  Target, Settings, LogOut, X,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/dashboard", icon: <LayoutDashboard size={19} />, label: "Dashboard" },
  { to: "/expenses",  icon: <Wallet          size={19} />, label: "Expenses"  },
  { to: "/income",    icon: <PiggyBank       size={19} />, label: "Income"    },
  { to: "/budgets",   icon: <Target          size={19} />, label: "Budgets"   },
  { to: "/settings",  icon: <Settings        size={19} />, label: "Settings"  },
];

let globalToggleSidebar = null;
export function toggleMobileSidebar() {
  if (globalToggleSidebar) globalToggleSidebar();
}

function Sidebar() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [open, setOpen]   = useState(false);

  globalToggleSidebar = () => setOpen((v) => !v);

  // ── LOCK BODY SCROLL WHEN SIDEBAR OPEN ──
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const handleNavClick = () => setOpen(false);

  return (
    <>
      {/* OVERLAY */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "sidebar-open" : ""}`}>

        {/* BRAND */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <LayoutDashboard size={18} />
          </div>
          <div className="sidebar-brand-text">
            <span>Expense</span>
            <b>Tracker</b>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav">
          {NAV_LINKS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-link-icon">{icon}</span>
              <span className="sidebar-link-label">{label}</span>
              <span className="sidebar-link-indicator" />
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <h4>{user?.name  || "User"}</h4>
              <p>{user?.email || ""}</p>
            </div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>

      </div>
    </>
  );
}

export default Sidebar;
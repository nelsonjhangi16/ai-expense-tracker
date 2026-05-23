import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Moon, Sun, Bell, Search,
  CheckCheck, Info, AlertTriangle,
  AlertCircle, LogOut, Settings,
  ChevronDown, Menu, Download,
} from "lucide-react";
import { useTheme }      from "../context/ThemeContext";
import { useAuth  }      from "../context/AuthContext";
import { usePWAInstall } from "../hooks/usePWAInstall";

function Navbar({
  notifications = [],
  clearNotifications,
  search,
  setSearch,
  onMenuClick,
}) {

  const { theme, toggleTheme }         = useTheme();
  const { user, logout }               = useAuth();
  const { install, canInstall, isIOS } = usePWAInstall();
  const location                       = useLocation();
  const navigate                       = useNavigate();

  const panelRef   = useRef(null);
  const profileRef = useRef(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile,       setShowProfile]       = useState(false);
  const [time,              setTime]              = useState(new Date());

  // ── CLOCK ──
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── CLOSE ON OUTSIDE CLICK ──
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current   && !panelRef.current.contains(e.target))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── PAGE DATA ──
  const pages = {
    "/dashboard": { title: "Dashboard",    sub: "Analytics overview"      },
    "/expenses":  { title: "Expenses",     sub: "Manage your spending"    },
    "/income":    { title: "Income",       sub: "Track your earnings"     },
    "/budgets":   { title: "Budgets",      sub: "Control your limits"     },
    "/settings":  { title: "Settings",     sub: "Application preferences" },
  };

  const page = pages[location.pathname] || {
    title: "Expense Tracker",
    sub:   "Smart finance dashboard",
  };

  // ── NOTIFICATION HELPERS ──
  const notifIcon = (type) => {
    if (type === "danger")  return <AlertCircle   size={14} color="#ef4444" />;
    if (type === "warning") return <AlertTriangle size={14} color="#f59e0b" />;
    return                         <Info          size={14} color="#6366f1" />;
  };

  const notifAccent = (type) =>
    type === "danger" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#6366f1";

  const count   = notifications.length;
  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // ── USER INITIALS ──
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    navigate("/");
  };

  return (
    <div className={`navbar ${theme}`}>

      {/* ── LEFT ── */}
      <div className="nav-left">
        <button className="nav-hamburger" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h2 className="nav-title">{page.title}</h2>
        <p className="nav-sub">{page.sub}</p>
      </div>

      {/* ── RIGHT ── */}
      <div className="nav-right">

        {/* SEARCH */}
        <div className="global-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CLOCK */}
        <div className="nav-clock">{timeStr}</div>

        {/* PWA INSTALL */}
        {canInstall && (
          <button
            className="nav-icon-btn pwa-install-btn"
            onClick={install}
            title={isIOS ? "Tap Share → Add to Home Screen" : "Install App"}
            style={{ position: "relative" }}
          >
            <Download size={16} />
            <span className="pwa-install-dot" />
          </button>
        )}

        {/* THEME */}
        <button className="nav-icon-btn" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* NOTIFICATIONS */}
        <div ref={panelRef} style={{ position: "relative" }}>
          <button
            className="nav-icon-btn"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <Bell size={16} />
            {count > 0 && <span className="nav-badge">{count}</span>}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-head">
                <div>
                  <h4>Notifications</h4>
                  <p>{count} unread alerts</p>
                </div>
                {count > 0 && (
                  <button
                    className="notif-clear"
                    onClick={() => { clearNotifications?.(); setShowNotifications(false); }}
                  >
                    <CheckCheck size={13} /> Clear
                  </button>
                )}
              </div>

              {count === 0 ? (
                <div className="notif-empty">
                  <Bell size={28} />
                  <p>No new notifications</p>
                  <span>You're all caught up</span>
                </div>
              ) : (
                <div className="notif-scroll">
                  {notifications.map((n, i) => (
                    <div
                      key={n.id || i}
                      className="notif-row"
                      style={{ borderLeft: `4px solid ${notifAccent(n.type)}` }}
                    >
                      <div className="notif-icon">{notifIcon(n.type)}</div>
                      <div className="notif-content">
                        <p>{n.message}</p>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFILE DROPDOWN */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            className="profile-btn-avatar"
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          >
            <span className="profile-initials">{initials}</span>
            <ChevronDown size={12} className={`profile-chevron ${showProfile ? "rotated" : ""}`} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">

              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">{initials}</div>
                <div className="profile-dropdown-info">
                  <h4>{user?.name  || "User"}</h4>
                  <p>{user?.email || ""}</p>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                className="profile-dropdown-item"
                onClick={() => { setShowProfile(false); navigate("/settings"); }}
              >
                <Settings size={14} /> Settings
              </button>

              <div className="profile-dropdown-divider" />

              <button
                className="profile-dropdown-item logout"
                onClick={handleLogout}
              >
                <LogOut size={14} /> Sign Out
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;
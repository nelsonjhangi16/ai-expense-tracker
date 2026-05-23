import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useApp }   from "../context/AppContext";
import { useAuth }  from "../context/AuthContext";
import {
  User, Mail, DollarSign, Palette,
  Save, RotateCcw, Moon, Sun, Check,
  ChevronDown, Search, Trash2, Shield,
  TrendingUp, TrendingDown, Wallet, Target,
  Lock, Eye, EyeOff,
} from "lucide-react";

const CURRENCY_GROUPS = [
  {
    group: "Major World",
    items: [
      { symbol: "$",   code: "USD", label: "US Dollar",          flag: "🇺🇸" },
      { symbol: "£",   code: "GBP", label: "British Pound",      flag: "🇬🇧" },
      { symbol: "€",   code: "EUR", label: "Euro",               flag: "🇪🇺" },
      { symbol: "¥",   code: "JPY", label: "Japanese Yen",       flag: "🇯🇵" },
      { symbol: "Fr",  code: "CHF", label: "Swiss Franc",        flag: "🇨🇭" },
      { symbol: "C$",  code: "CAD", label: "Canadian Dollar",    flag: "🇨🇦" },
      { symbol: "A$",  code: "AUD", label: "Australian Dollar",  flag: "🇦🇺" },
      { symbol: "NZ$", code: "NZD", label: "New Zealand Dollar", flag: "🇳🇿" },
      { symbol: "S$",  code: "SGD", label: "Singapore Dollar",   flag: "🇸🇬" },
      { symbol: "HK$", code: "HKD", label: "Hong Kong Dollar",   flag: "🇭🇰" },
    ],
  },
  {
    group: "South & Southeast Asia",
    items: [
      { symbol: "₹",  code: "INR", label: "Indian Rupee",       flag: "🇮🇳" },
      { symbol: "₨",  code: "PKR", label: "Pakistani Rupee",    flag: "🇵🇰" },
      { symbol: "৳",  code: "BDT", label: "Bangladeshi Taka",   flag: "🇧🇩" },
      { symbol: "Rs", code: "LKR", label: "Sri Lankan Rupee",   flag: "🇱🇰" },
      { symbol: "Rp", code: "IDR", label: "Indonesian Rupiah",  flag: "🇮🇩" },
      { symbol: "₱",  code: "PHP", label: "Philippine Peso",    flag: "🇵🇭" },
      { symbol: "RM", code: "MYR", label: "Malaysian Ringgit",  flag: "🇲🇾" },
      { symbol: "฿",  code: "THB", label: "Thai Baht",          flag: "🇹🇭" },
      { symbol: "₫",  code: "VND", label: "Vietnamese Dong",    flag: "🇻🇳" },
    ],
  },
  {
    group: "East Asia",
    items: [
      { symbol: "₩",   code: "KRW", label: "South Korean Won", flag: "🇰🇷" },
      { symbol: "NT$", code: "TWD", label: "Taiwan Dollar",     flag: "🇹🇼" },
      { symbol: "¥",   code: "CNY", label: "Chinese Yuan",      flag: "🇨🇳" },
    ],
  },
  {
    group: "Middle East",
    items: [
      { symbol: "﷼",   code: "SAR", label: "Saudi Riyal",    flag: "🇸🇦" },
      { symbol: "د.إ", code: "AED", label: "UAE Dirham",      flag: "🇦🇪" },
      { symbol: "د.ك", code: "KWD", label: "Kuwaiti Dinar",   flag: "🇰🇼" },
      { symbol: "﷼",   code: "QAR", label: "Qatari Riyal",    flag: "🇶🇦" },
      { symbol: "BD",  code: "BHD", label: "Bahraini Dinar",  flag: "🇧🇭" },
      { symbol: "₪",   code: "ILS", label: "Israeli Shekel",  flag: "🇮🇱" },
      { symbol: "₺",   code: "TRY", label: "Turkish Lira",    flag: "🇹🇷" },
    ],
  },
  {
    group: "Africa",
    items: [
      { symbol: "₦",   code: "NGN", label: "Nigerian Naira",     flag: "🇳🇬" },
      { symbol: "R",   code: "ZAR", label: "South African Rand", flag: "🇿🇦" },
      { symbol: "KSh", code: "KES", label: "Kenyan Shilling",    flag: "🇰🇪" },
      { symbol: "GH₵", code: "GHS", label: "Ghanaian Cedi",      flag: "🇬🇭" },
      { symbol: "EGP", code: "EGP", label: "Egyptian Pound",     flag: "🇪🇬" },
      { symbol: "MAD", code: "MAD", label: "Moroccan Dirham",    flag: "🇲🇦" },
      { symbol: "ETB", code: "ETB", label: "Ethiopian Birr",     flag: "🇪🇹" },
      { symbol: "XOF", code: "XOF", label: "West African CFA",   flag: "🌍" },
    ],
  },
  {
    group: "Europe (non-Euro)",
    items: [
      { symbol: "zł",  code: "PLN", label: "Polish Zloty",      flag: "🇵🇱" },
      { symbol: "Kč",  code: "CZK", label: "Czech Koruna",      flag: "🇨🇿" },
      { symbol: "Ft",  code: "HUF", label: "Hungarian Forint",  flag: "🇭🇺" },
      { symbol: "kr",  code: "SEK", label: "Swedish Krona",     flag: "🇸🇪" },
      { symbol: "kr",  code: "NOK", label: "Norwegian Krone",   flag: "🇳🇴" },
      { symbol: "kr",  code: "DKK", label: "Danish Krone",      flag: "🇩🇰" },
      { symbol: "₴",   code: "UAH", label: "Ukrainian Hryvnia", flag: "🇺🇦" },
      { symbol: "₽",   code: "RUB", label: "Russian Ruble",     flag: "🇷🇺" },
    ],
  },
  {
    group: "Americas",
    items: [
      { symbol: "R$", code: "BRL", label: "Brazilian Real",  flag: "🇧🇷" },
      { symbol: "$",  code: "MXN", label: "Mexican Peso",    flag: "🇲🇽" },
      { symbol: "$",  code: "ARS", label: "Argentine Peso",  flag: "🇦🇷" },
      { symbol: "$",  code: "CLP", label: "Chilean Peso",    flag: "🇨🇱" },
      { symbol: "$",  code: "COP", label: "Colombian Peso",  flag: "🇨🇴" },
      { symbol: "S/", code: "PEN", label: "Peruvian Sol",    flag: "🇵🇪" },
    ],
  },
  {
    group: "Crypto",
    items: [
      { symbol: "₿", code: "BTC", label: "Bitcoin",  flag: "🟠" },
      { symbol: "Ξ", code: "ETH", label: "Ethereum", flag: "🔷" },
    ],
  },
];

const ALL_CURRENCIES = CURRENCY_GROUPS.flatMap((g) => g.items);

const DEFAULT_SETTINGS = {
  name: "", email: "", currency: "$", currencyCode: "USD",
  monthlyBudget: "", notifications: true, flag: "🇺🇸",
};

// ================= CURRENCY DROPDOWN =================
function CurrencyDropdown({ value, valueCode, onChange }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const dropRef               = useRef(null);
  const searchRef             = useRef(null);

  const selected = ALL_CURRENCIES.find((c) => c.code === valueCode)
    || ALL_CURRENCIES.find((c) => c.symbol === value)
    || ALL_CURRENCIES[0];

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query.trim()
    ? ALL_CURRENCIES.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())  ||
        c.symbol.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  const handleSelect = (c) => {
    onChange(c);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="curr-dropdown" ref={dropRef}>
      <button
        className={`curr-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="curr-flag">{selected.flag}</span>
        <div className="curr-trigger-info">
          <span className="curr-trigger-code">{selected.code}</span>
          <span className="curr-trigger-label">{selected.label}</span>
        </div>
        <span className="curr-trigger-symbol">{selected.symbol}</span>
        <ChevronDown size={14} className={`curr-chevron ${open ? "rotated" : ""}`} />
      </button>

      {open && (
        <div className="curr-panel">
          <div className="curr-search">
            <Search size={13} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search currency..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="curr-search-clear" onClick={() => setQuery("")}>×</button>
            )}
          </div>
          <div className="curr-list">
            {filtered ? (
              filtered.length === 0 ? (
                <div className="curr-empty">No currencies found</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    className={`curr-item ${c.code === selected.code ? "active" : ""}`}
                    onClick={() => handleSelect(c)}
                  >
                    <span className="curr-item-flag">{c.flag}</span>
                    <div className="curr-item-info">
                      <span className="curr-item-code">{c.code}</span>
                      <span className="curr-item-label">{c.label}</span>
                    </div>
                    <span className="curr-item-symbol">{c.symbol}</span>
                    {c.code === selected.code && <Check size={12} className="curr-item-check" />}
                  </button>
                ))
              )
            ) : (
              CURRENCY_GROUPS.map((group) => (
                <div key={group.group}>
                  <div className="curr-group-label">{group.group}</div>
                  {group.items.map((c) => (
                    <button
                      key={c.code}
                      className={`curr-item ${c.code === selected.code ? "active" : ""}`}
                      onClick={() => handleSelect(c)}
                    >
                      <span className="curr-item-flag">{c.flag}</span>
                      <div className="curr-item-info">
                        <span className="curr-item-code">{c.code}</span>
                        <span className="curr-item-label">{c.label}</span>
                      </div>
                      <span className="curr-item-symbol">{c.symbol}</span>
                      {c.code === selected.code && <Check size={12} className="curr-item-check" />}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= SETTINGS PAGE =================
function Settings({ toast }) {

  const { theme, toggleTheme }                  = useTheme();
  const { settings, setSettings, expenses,
          incomes, budgets, fmt }                = useApp();
  const { user, updateProfile }                 = useAuth();

  const [saved,          setSaved]          = useState(false);
  const [profileForm,    setProfileForm]    = useState({
    name:  user?.name  || "",
    email: user?.email || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg,     setProfileMsg]     = useState("");
  const [pwForm,         setPwForm]         = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading,      setPwLoading]      = useState(false);
  const [pwMsg,          setPwMsg]          = useState("");
  const [showPw,         setShowPw]         = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const saveSettings = () => {
    setSaved(true);
    toast?.({ message: "✅ Settings saved successfully", type: "success" });
    setTimeout(() => setSaved(false), 2000);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast?.({ message: "🔄 Settings reset to defaults", type: "info" });
  };

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg("");
    const result = await updateProfile(profileForm.name, profileForm.email);
    if (result.success) {
      setProfileMsg("success");
      set("name",  profileForm.name);
      set("email", profileForm.email);
      toast?.({ message: "✅ Profile updated successfully", type: "success" });
    } else {
      setProfileMsg(result.message || "Update failed");
      toast?.({ message: result.message || "Update failed", type: "error" });
    }
    setProfileLoading(false);
  };

  const changePassword = async () => {
    setPwMsg("");
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      setPwMsg("All fields required"); return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg("Passwords do not match"); return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMsg("Password must be at least 6 characters"); return;
    }
    setPwLoading(true);
    const { changePasswordAPI } = await import("../services/api");
    const data = await changePasswordAPI({
      currentPassword: pwForm.current,
      newPassword:     pwForm.newPw,
    });
    if (data.message === "Password updated successfully") {
      toast?.({ message: "✅ Password changed successfully", type: "success" });
      setPwForm({ current: "", newPw: "", confirm: "" });
      setPwMsg("success");
    } else {
      setPwMsg(data.message || "Failed to change password");
      toast?.({ message: data.message || "Failed", type: "error" });
    }
    setPwLoading(false);
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalIncome   = incomes.reduce((s, i)  => s + Number(i.amount || 0), 0);
  const netBalance    = totalIncome - totalExpenses;
  const goalPct       = settings.monthlyBudget
    ? Math.min((totalExpenses / Number(settings.monthlyBudget)) * 100, 100)
    : 0;

  return (
    <div className="settings-page">

      {/* ── HEADER ── */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your preferences and account details</p>
        </div>
        <div className="settings-header-actions">
          <button className="settings-reset-btn" onClick={resetSettings}>
            <RotateCcw size={14} /> Reset
          </button>
          <button
            className={`settings-save-btn ${saved ? "saved-state" : ""}`}
            onClick={saveSettings}
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* ── ROW 1: Profile | Finance | Appearance ── */}
      <div className="settings-row-top">

        {/* PROFILE */}
        <div className="settings-card">
          <div className="settings-card-title"><User size={15} />Profile</div>

          <div className="settings-avatar-row">
            <div className="settings-avatar-large">
              {(profileForm.name || user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="settings-profile-info">
              <h3>{profileForm.name || user?.name || "No name set"}</h3>
              <p>{profileForm.email || user?.email || "No email set"}</p>
              <span className="settings-currency-pill">
                {settings.flag || "🌐"} {settings.currencyCode || "USD"} · {settings.currency}
              </span>
            </div>
          </div>

          <div className="setting-item" style={{ marginTop: 18 }}>
            <label>Full Name</label>
            <div className="setting-input-wrap">
              <User size={13} className="setting-input-icon" />
              <input
                type="text"
                placeholder="Enter your name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
          </div>

          <div className="setting-item">
            <label>Email Address</label>
            <div className="setting-input-wrap">
              <Mail size={13} className="setting-input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
          </div>

          <button
            className="settings-save-btn"
            onClick={saveProfile}
            disabled={profileLoading}
            style={{ marginTop: 14, width: "100%", justifyContent: "center" }}
          >
            {profileLoading ? "Saving..." : <><Save size={14} /> Update Profile</>}
          </button>

          {profileMsg === "success" && (
            <p className="setting-hint" style={{ color: "#22c55e", marginTop: 8 }}>
              ✅ Profile updated successfully
            </p>
          )}
          {profileMsg && profileMsg !== "success" && (
            <p className="setting-hint" style={{ color: "#ef4444", marginTop: 8 }}>
              {profileMsg}
            </p>
          )}
        </div>

        {/* FINANCE */}
        <div className="settings-card settings-finance-center">
          <div className="settings-card-title"><DollarSign size={15} />Finance</div>

          <div className="setting-item">
            <label>Currency</label>
            <CurrencyDropdown
              value={settings.currency}
              valueCode={settings.currencyCode || "USD"}
              onChange={(c) => {
                set("currency",     c.symbol);
                set("currencyCode", c.code);
                set("flag",         c.flag);
              }}
            />
            <p className="setting-hint">
              Preview: <b>{settings.currency}1,000.00</b> · Updates everywhere instantly
            </p>
          </div>

          <div className="setting-item">
            <label>Monthly Budget Goal</label>
            <div className="setting-input-wrap">
              <span className="setting-currency-prefix">{settings.currency}</span>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={settings.monthlyBudget}
                onChange={(e) => set("monthlyBudget", e.target.value)}
              />
            </div>
            {settings.monthlyBudget && (
              <p className="setting-hint">Goal: <b>{fmt(Number(settings.monthlyBudget))}</b></p>
            )}
          </div>
        </div>

        {/* APPEARANCE */}
        <div className="settings-card">
          <div className="settings-card-title"><Palette size={15} />Appearance</div>

          <div className="setting-item">
            <label>Theme</label>
            <div className="theme-toggle-row">
              <button
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => theme === "dark" && toggleTheme()}
              >
                <Sun size={15} /> Light
              </button>
              <button
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => theme === "light" && toggleTheme()}
              >
                <Moon size={15} /> Dark
              </button>
            </div>
          </div>

          <div className="setting-item">
            <label>Budget Notifications</label>
            <div className="notif-toggle-row">
              <div
                className={`settings-toggle ${settings.notifications ? "on" : ""}`}
                onClick={() => set("notifications", !settings.notifications)}
              >
                <div className="settings-toggle-thumb" />
              </div>
              <span className="setting-hint" style={{ margin: 0 }}>
                {settings.notifications
                  ? "Alerts fire when you hit budget limits"
                  : "Budget alerts disabled"}
              </span>
            </div>
          </div>

          <div className="settings-quick-stats">
            <div className="settings-quick-stat">
              <b>{expenses.length}</b>
              <span>Transactions</span>
            </div>
            <div className="settings-quick-stat">
              <b>{incomes.length}</b>
              <span>Income Entries</span>
            </div>
            <div className="settings-quick-stat">
              <b>{budgets.length}</b>
              <span>Budgets</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── ROW 2: Monthly Goal | Change Password | Data Management ── */}
      <div className="settings-row-bottom">

        {/* MONTHLY GOAL */}
        <div className="settings-card">
          <div className="settings-card-title"><Target size={15} />Monthly Budget Goal</div>

          {!settings.monthlyBudget ? (
            <div className="settings-no-goal">
              <Target size={32} opacity={0.2} />
              <p>No monthly goal set</p>
              <span>Set a budget goal in the Finance section above</span>
            </div>
          ) : (
            <>
              <div className="settings-goal-header">
                <div>
                  <h2>{fmt(totalExpenses)}</h2>
                  <span>spent of {fmt(Number(settings.monthlyBudget))}</span>
                </div>
                <div
                  className="settings-goal-pct-badge"
                  style={{
                    background: goalPct >= 100 ? "rgba(239,68,68,0.12)"
                      : goalPct >= 75 ? "rgba(245,158,11,0.12)"
                      : "rgba(34,197,94,0.12)",
                    color: goalPct >= 100 ? "#ef4444"
                      : goalPct >= 75 ? "#f59e0b"
                      : "#22c55e",
                  }}
                >
                  {goalPct.toFixed(0)}%
                </div>
              </div>

              <div className="settings-budget-bar-wrap" style={{ margin: "16px 0 8px" }}>
                <div
                  className="settings-budget-bar-fill"
                  style={{
                    width:      `${goalPct}%`,
                    background: goalPct >= 100 ? "#ef4444"
                      : goalPct >= 75 ? "#f59e0b"
                      : "#22c55e",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <div className="settings-goal-footer">
                <span className="setting-hint" style={{ margin: 0 }}>
                  {totalExpenses > Number(settings.monthlyBudget)
                    ? `⚠️ Over budget by ${fmt(totalExpenses - Number(settings.monthlyBudget))}`
                    : `✅ ${fmt(Number(settings.monthlyBudget) - totalExpenses)} remaining`}
                </span>
                <span className="setting-hint" style={{ margin: 0 }}>
                  {(100 - goalPct).toFixed(0)}% left
                </span>
              </div>

              <div className="settings-goal-breakdown">
                <div className="settings-goal-breakdown-item">
                  <span>Budget</span>
                  <b>{fmt(Number(settings.monthlyBudget))}</b>
                </div>
                <div className="settings-goal-breakdown-item">
                  <span>Spent</span>
                  <b style={{ color: "#ef4444" }}>{fmt(totalExpenses)}</b>
                </div>
                <div className="settings-goal-breakdown-item">
                  <span>Remaining</span>
                  <b style={{ color: "#22c55e" }}>
                    {fmt(Math.max(Number(settings.monthlyBudget) - totalExpenses, 0))}
                  </b>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CHANGE PASSWORD */}
        <div className="settings-card">
          <div className="settings-card-title"><Shield size={15} />Change Password</div>

          <div className="setting-item">
            <label>Current Password</label>
            <div className="setting-input-wrap">
              <Lock size={13} className="setting-input-icon" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter current password"
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              />
            </div>
          </div>

          <div className="setting-item">
            <label>New Password</label>
            <div className="setting-input-wrap">
              <Lock size={13} className="setting-input-icon" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="At least 6 characters"
                value={pwForm.newPw}
                onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
              />
            </div>
          </div>

          <div className="setting-item">
            <label>Confirm New Password</label>
            <div className="setting-input-wrap">
              <Lock size={13} className="setting-input-icon" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Repeat new password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              />
            </div>
          </div>

          <div className="notif-toggle-row" style={{ marginBottom: 14 }}>
            <div
              className={`settings-toggle ${showPw ? "on" : ""}`}
              onClick={() => setShowPw(!showPw)}
            >
              <div className="settings-toggle-thumb" />
            </div>
            <span className="setting-hint" style={{ margin: 0 }}>
              {showPw ? "Hide passwords" : "Show passwords"}
            </span>
          </div>

          <button
            className="settings-save-btn"
            onClick={changePassword}
            disabled={pwLoading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {pwLoading ? "Updating..." : <><Shield size={14} /> Change Password</>}
          </button>

          {pwMsg === "success" && (
            <p className="setting-hint" style={{ color: "#22c55e", marginTop: 8 }}>
              ✅ Password changed successfully
            </p>
          )}
          {pwMsg && pwMsg !== "success" && (
            <p className="setting-hint" style={{ color: "#ef4444", marginTop: 8 }}>
              {pwMsg}
            </p>
          )}
        </div>

        {/* DATA MANAGEMENT */}
        <div className="settings-card">
          <div className="settings-card-title"><Shield size={15} />Data Management</div>

          <div className="settings-data-info">
            <div className="settings-data-row">
              <span>Expenses stored</span>
              <b>{expenses.length} records</b>
            </div>
            <div className="settings-data-row">
              <span>Income entries</span>
              <b>{incomes.length} records</b>
            </div>
            <div className="settings-data-row">
              <span>Budget categories</span>
              <b>{budgets.length} records</b>
            </div>
            <div className="settings-data-row">
              <span>Storage type</span>
              <b style={{ color: user ? "#22c55e" : "#f59e0b" }}>
                {user ? "☁️ Cloud Database" : "💾 Local Browser"}
              </b>
            </div>
            <div className="settings-data-row">
              <span>Account</span>
              <b style={{ color: user ? "#22c55e" : "#94a3b8" }}>
                {user ? "✅ Logged in" : "⚠️ Not logged in"}
              </b>
            </div>
            <div className="settings-data-row">
              <span>Auto sync</span>
              <b style={{ color: user ? "#22c55e" : "#94a3b8" }}>
                {user ? "✅ Active" : "❌ Disabled"}
              </b>
            </div>
          </div>

          <p className="setting-hint" style={{ margin: "14px 0" }}>
            {user
              ? "Your data is securely synced to MongoDB Atlas. Available on any device."
              : "Data is stored locally. Login to enable cloud sync."}
          </p>

          <button
            className="settings-danger-btn"
            onClick={() => {
              if (window.confirm("Clear ALL data? This cannot be undone.")) {
                localStorage.clear();
                toast?.({ message: "🗑 All data cleared", type: "error" });
                window.location.reload();
              }
            }}
          >
            <Trash2 size={14} /> Clear All Data
          </button>
        </div>

      </div>

    </div>
  );
}

export default Settings;
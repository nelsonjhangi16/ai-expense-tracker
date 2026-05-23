import { useState } from "react";
import { useApp }           from "./context/AppContext";
import { useAuth }          from "./context/AuthContext";
import { useTheme }         from "./context/ThemeContext";
import { useNotifications } from "./hooks/useNotifications";
import { useToast }         from "./hooks/useToast";

import {
  BrowserRouter, Routes, Route,
  Navigate, useLocation,
} from "react-router-dom";

import Navbar              from "./components/Navbar";
import Sidebar, { toggleMobileSidebar } from "./components/Sidebar";
import ToastContainer      from "./components/ToastContainer";
import Dashboard           from "./pages/Dashboard";
import Expenses            from "./pages/Expenses";
import Income              from "./pages/Income";
import Budgets             from "./pages/Budgets";
import Settings            from "./pages/Settings";
import HomePage            from "./pages/HomePage";
import LoginPage           from "./pages/LoginPage";
import RegisterPage        from "./pages/RegisterPage";
import ForgotPasswordPage  from "./pages/ForgotPasswordPage";
import ResetPasswordPage   from "./pages/ResetPasswordPage";
import PageTransition      from "./components/PageTransition";

// ── PROTECTED ROUTE ──
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div style={{
        height:         "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     "#0f172a",
        color:          "white",
        fontSize:       16,
        flexDirection:  "column",
        gap:            12,
      }}>
        <div style={{
          width:        40,
          height:       40,
          border:       "3px solid rgba(99,102,241,0.2)",
          borderTop:    "3px solid #6366f1",
          borderRadius: "50%",
          animation:    "spin 0.8s linear infinite",
        }} />
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ── APP LAYOUT ──
function AppLayout({ toast }) {
  const { theme }                              = useTheme();
  const { expenses, budgets, settings,
          search, setSearch }                  = useApp();
  const { notifications, clearNotifications } = useNotifications(
    expenses,
    budgets,
    settings.notifications
  );

  return (
    <div className={`app ${theme}`}>
      <Sidebar />
      <div className="main-content">
        <Navbar
          search={search}
          setSearch={setSearch}
          notifications={notifications}
          clearNotifications={clearNotifications}
          onMenuClick={toggleMobileSidebar}
        />
        <div className="page-content">
          <PageTransition>
            <Routes>
              <Route path="/"          element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses"  element={<Expenses  toast={toast} />} />
              <Route path="/income"    element={<Income    toast={toast} />} />
              <Route path="/budgets"   element={<Budgets   toast={toast} />} />
              <Route path="/settings"  element={<Settings  toast={toast} />} />
            </Routes>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──
function App() {
  const { toasts, toast, removeToast } = useToast();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                       element={<HomePage />} />
        <Route path="/login"                  element={<LoginPage />} />
        <Route path="/register"               element={<RegisterPage />} />
        <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />

        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout toast={toast} />
          </ProtectedRoute>
        } />
      </Routes>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </BrowserRouter>
  );
}

export default App;
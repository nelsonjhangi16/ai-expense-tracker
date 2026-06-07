const BASE = "https://ai-expense-tracker-backend-psi.vercel.app/api";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ── AUTH ──
export const registerAPI = (data) =>
  fetch(`${BASE}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const verifyEmailAPI = (email, code) =>
  fetch(`${BASE}/auth/verify-email`, { method: "POST", headers: headers(), body: JSON.stringify({ email, code }) })
    .then((r) => r.json());

export const loginAPI = (data) =>
  fetch(`${BASE}/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const getMeAPI = () =>
  fetch(`${BASE}/auth/me`, { headers: headers() }).then((r) => r.json());

export const updateProfileAPI = (data) =>
  fetch(`${BASE}/auth/profile`, { method: "PUT", headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const updateSettingsAPI = (settings) =>
  fetch(`${BASE}/auth/settings`, { method: "PUT", headers: headers(), body: JSON.stringify(settings) })
    .then((r) => r.json());

export const changePasswordAPI = (data) =>
  fetch(`${BASE}/auth/password`, { method: "PUT", headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const forgotPasswordAPI = (email) =>
  fetch(`${BASE}/auth/forgot-password`, { method: "POST", headers: headers(), body: JSON.stringify({ email }) })
    .then((r) => r.json());

export const resetPasswordAPI = (token, password) =>
  fetch(`${BASE}/auth/reset-password/${token}`, { method: "POST", headers: headers(), body: JSON.stringify({ password }) })
    .then((r) => r.json());

// ── DATA ──
export const getDataAPI = () =>
  fetch(`${BASE}/data`, { headers: headers() }).then((r) => r.json());

export const saveDataAPI = (data) =>
  fetch(`${BASE}/data`, { method: "PUT", headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());
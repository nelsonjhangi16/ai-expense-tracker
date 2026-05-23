import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Shield, Zap, BarChart2,
  ChevronDown, ChevronUp, ArrowRight,
  PieChart, Bell, RefreshCw, Download,
  Lock, Smartphone, Target, CheckCircle,
  LayoutDashboard,
} from "lucide-react";

const BENEFITS = [
  {
    icon: <BarChart2 size={24} />,
    title: "Smart Analytics",
    desc:  "Beautiful charts and insights showing exactly where your money goes every month.",
    color: "#6366f1",
  },
  {
    icon: <Shield size={24} />,
    title: "Secure & Private",
    desc:  "JWT encrypted authentication. Your financial data is never shared with anyone.",
    color: "#22c55e",
  },
  {
    icon: <Zap size={24} />,
    title: "AI Powered",
    desc:  "Auto-categorizes expenses and gives smart recommendations to improve your finances.",
    color: "#f59e0b",
  },
  {
    icon: <RefreshCw size={24} />,
    title: "Recurring Tracking",
    desc:  "Set weekly or monthly recurring expenses — tracked automatically every cycle.",
    color: "#06b6d4",
  },
  {
    icon: <Bell size={24} />,
    title: "Budget Alerts",
    desc:  "Real-time notifications when you're approaching or exceeding your budget limits.",
    color: "#ef4444",
  },
  {
    icon: <PieChart size={24} />,
    title: "60+ Currencies",
    desc:  "Full support for currencies worldwide. Switch anytime from Settings.",
    color: "#8b5cf6",
  },
  {
    icon: <Download size={24} />,
    title: "Export Reports",
    desc:  "Download your expense history as CSV or beautifully formatted PDF reports.",
    color: "#f97316",
  },
  {
    icon: <Target size={24} />,
    title: "Budget Goals",
    desc:  "Set monthly spending goals and track your progress with visual progress bars.",
    color: "#ec4899",
  },
  {
    icon: <Smartphone size={24} />,
    title: "Mobile Friendly",
    desc:  "Fully responsive design that works perfectly on phones, tablets, and desktops.",
    color: "#22c55e",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Account",
    desc:  "Sign up for free in seconds. No credit card required.",
  },
  {
    step: "02",
    title: "Add Expenses",
    desc:  "Log your expenses manually or let AI auto-categorize them for you.",
  },
  {
    step: "03",
    title: "Set Budgets",
    desc:  "Create budget limits per category and get alerted when you're close.",
  },
  {
    step: "04",
    title: "Track & Grow",
    desc:  "View insights, export reports, and make smarter financial decisions.",
  },
];

const FAQS = [
  {
    q: "Is my financial data safe?",
    a: "Yes — your data is protected with JWT authentication and bcrypt password hashing. We never share your data with anyone.",
  },
  {
    q: "Is it completely free?",
    a: "Yes, 100% free forever. No hidden charges, no premium tiers, no credit card required.",
  },
  {
    q: "Can I export my data?",
    a: "Absolutely. Export all expenses and income as CSV (for Excel/Sheets) or PDF reports from the Expenses or Income pages.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes — fully responsive, works perfectly on phones, tablets, and all screen sizes.",
  },
  {
    q: "Can I track multiple currencies?",
    a: "Yes — 60+ currencies supported. Change your currency anytime in Settings and all amounts update instantly.",
  },
  {
    q: "What is recurring expense tracking?",
    a: "Mark any expense or income as weekly or monthly recurring. The app auto-generates a new entry when it's due — no manual entry needed.",
  },
  {
    q: "Can I set budget limits?",
    a: "Yes — create budgets per category. You'll get real-time alerts at 50%, 75%, and 100% of your budget limit.",
  },
  {
    q: "What if I forget my password?",
    a: "Use the Forgot Password link on the login page. We'll send a reset link to your email — valid for 15 minutes.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* ── NAVBAR ── */}
      <nav className="home-nav">
        <div className="home-nav-logo" onClick={() => navigate("/")}>
          <LayoutDashboard size={22} />
          <span>Expense <b>Tracker</b></span>
        </div>
        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="home-nav-actions">
          <button className="home-nav-login"    onClick={() => navigate("/login")}>Login</button>
          <button className="home-nav-register" onClick={() => navigate("/register")}>Get Started Free</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-badge">
          <Zap size={13} /> AI Powered — Free Forever
        </div>
        <h1 className="home-hero-title">
          The Smartest Way to<br />
          <span className="home-hero-gradient">Track Your Money</span>
        </h1>
        <p className="home-hero-sub">
          Expense Tracker helps you monitor spending, set budgets, and grow wealth
          with AI-powered insights. Simple, secure, and completely free.
        </p>
        <div className="home-hero-btns">
          <button className="home-hero-cta" onClick={() => navigate("/register")}>
            Start Tracking Free <ArrowRight size={16} />
          </button>
          <button className="home-hero-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>

        {/* STATS */}
        <div className="home-hero-stats">
          <div className="home-stat">
            <h3>60+</h3>
            <p>Currencies</p>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <h3>100%</h3>
            <p>Free</p>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <h3>AI</h3>
            <p>Powered</p>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <h3>JWT</h3>
            <p>Secured</p>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <h3>9+</h3>
            <p>Features</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="home-benefits" id="features">
        <div className="home-section-header">
          <div className="home-section-badge">Features</div>
          <h2>Everything you need to manage money</h2>
          <p>Powerful tools designed to give you complete control over your finances</p>
        </div>
        <div className="home-benefits-grid">
          {BENEFITS.map((b, i) => (
            <div className="home-benefit-card" key={i}>
              <div className="home-benefit-icon" style={{
                background: `${b.color}18`,
                color: b.color,
              }}>
                {b.icon}
              </div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-how" id="how">
        <div className="home-section-header">
          <div className="home-section-badge">How It Works</div>
          <h2>Get started in 4 simple steps</h2>
          <p>Set up your account and start tracking in under 2 minutes</p>
        </div>
        <div className="home-how-grid">
          {HOW_IT_WORKS.map((h, i) => (
            <div className="home-how-card" key={i}>
              <div className="home-how-step">{h.step}</div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="home-how-arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CHECKLIST SECTION ── */}
      <section className="home-checklist-section">
        <div className="home-checklist-content">
          <div className="home-section-badge">Why Choose Us</div>
          <h2>Built for real people,<br />not accountants</h2>
          <p>No complex spreadsheets. No confusing interfaces. Just simple, powerful finance tracking.</p>
          <div className="home-checklist">
            {[
              "Free forever — no credit card needed",
              "AI auto-categorizes your expenses",
              "Real-time budget alerts",
              "Export to CSV and PDF",
              "60+ currencies supported",
              "Secure JWT authentication",
              "Recurring expense automation",
              "Works on all devices",
            ].map((item, i) => (
              <div className="home-checklist-item" key={i}>
                <CheckCircle size={18} color="#22c55e" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button className="home-hero-cta" onClick={() => navigate("/register")} style={{ marginTop: 32 }}>
            Create Free Account <ArrowRight size={16} />
          </button>
        </div>
        <div className="home-checklist-visual">
          <div className="home-visual-card">
            <div className="home-visual-header">
              <div className="home-visual-dot red" />
              <div className="home-visual-dot yellow" />
              <div className="home-visual-dot green" />
              <span>Dashboard Overview</span>
            </div>
            <div className="home-visual-stats">
              <div className="home-visual-stat green">
                <span>Total Income</span>
                <b>$12,450.00</b>
                <small>↑ This month</small>
              </div>
              <div className="home-visual-stat red">
                <span>Total Expenses</span>
                <b>$8,230.00</b>
                <small>↓ -12% vs last</small>
              </div>
            </div>
            <div className="home-visual-balance">
              <span>Net Balance</span>
              <h3>+$4,220.00</h3>
            </div>
            <div className="home-visual-bars">
              {[
                { label: "Food",          pct: 65, color: "#f97316" },
                { label: "Transport",     pct: 40, color: "#6366f1" },
                { label: "Shopping",      pct: 80, color: "#8b5cf6" },
                { label: "Entertainment", pct: 30, color: "#22c55e" },
              ].map((b, i) => (
                <div className="home-visual-bar-row" key={i}>
                  <span>{b.label}</span>
                  <div className="home-visual-bar-wrap">
                    <div className="home-visual-bar-fill"
                      style={{ width: `${b.pct}%`, background: b.color }}
                    />
                  </div>
                  <span>{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="home-cta-banner">
        <div className="home-cta-banner-content">
          <Lock size={32} style={{ marginBottom: 16, opacity: 0.8 }} />
          <h2>Your data. Your control. Always.</h2>
          <p>
            Bank-grade JWT security. Encrypted passwords. No data selling. Ever.
            <br />Start tracking your finances with complete peace of mind.
          </p>
          <button className="home-hero-cta" onClick={() => navigate("/register")}>
            Get Started Free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="home-faq" id="faq">
        <div className="home-section-header">
          <div className="home-section-badge">FAQ</div>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about Expense Tracker</p>
        </div>
        <div className="home-faq-list">
          {FAQS.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-nav-logo">
          <LayoutDashboard size={18} />
          <span>Expense <b>Tracker</b></span>
        </div>
        <p>© 2026 Expense Tracker. Built with ❤️ for better financial health.</p>
        <div className="home-footer-links">
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </footer>

    </div>
  );
}

export default HomePage;
import { Link } from "react-router-dom";

const features = [
  {
    icon: "🏦",
    title: "Loan Management",
    desc: "Track all your loan accounts — personal, home, car, business — in one place.",
  },
  {
    icon: "📊",
    title: "Financial Health Engine",
    desc: "Get your financial health score, DTI ratio, EMI burden, and savings gap analysis.",
  },
  {
    icon: "🤝",
    title: "Settlement Recommendations",
    desc: "AI-computed settlement amounts and probability scores based on your financial profile.",
  },
  {
    icon: "✨",
    title: "Gemini AI Negotiation",
    desc: "Generate professional settlement letters, negotiation emails, and strategies powered by Google Gemini.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Powered by Google Gemini AI</div>
          <h1 className="hero-title">
            Take Control of Your <span className="hero-highlight">Debt Recovery</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered platform that analyzes your financial health, generates intelligent
            settlement recommendations, and crafts professional negotiation strategies to
            help you reclaim financial freedom.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Login
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="hero-card hero-card--1">
              <div className="hc-label">Financial Health Score</div>
              <div className="hc-value hc-value--green">78 / 100</div>
              <div className="hc-sub">Moderate — Improving</div>
            </div>
            <div className="hero-card hero-card--2">
              <div className="hc-label">Settlement Offer</div>
              <div className="hc-value hc-value--blue">₹3,20,000</div>
              <div className="hc-sub">64% of loan · 72% success rate</div>
            </div>
            <div className="hero-card hero-card--3">
              <div className="hc-label">AI Generated</div>
              <div className="hc-value hc-value--purple">📄 Letter Ready</div>
              <div className="hc-sub">Settlement letter · Just now</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────── */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Everything You Need to Recover</h2>
          <p className="features-subtitle">
            From analysis to negotiation — the full debt relief workflow in one platform.
          </p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="how-section">
        <div className="how-container">
          <h2 className="features-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Add Your Loans</h4>
              <p>Enter your loan details — amount, EMI, income, overdue months.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Analyze Health</h4>
              <p>Get your financial health score, DTI ratio, and stress analysis instantly.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Get Settlement</h4>
              <p>The engine recommends your optimal settlement amount and probability.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>AI Negotiation</h4>
              <p>Generate professional letters and strategies with one click using Gemini AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="cta-section">
        <h2>Ready to Start Your Recovery?</h2>
        <p>Free to use. No credit card required.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account
        </Link>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-brand">💰 DebtRelief AI</div>
        <p className="footer-note">
          AI Powered Debt Relief &amp; Financial Recovery Platform · Built with FastAPI + React + Gemini AI
        </p>
      </footer>
    </div>
  );
}

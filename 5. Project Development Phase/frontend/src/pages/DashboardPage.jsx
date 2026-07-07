import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { dashboardService } from "../services/dashboardService";
import StatCard from "../components/StatCard";
import HealthScoreBadge from "../components/HealthScoreBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const contentTypeLabels = {
  settlement_letter: "Settlement Letter",
  negotiation_email: "Negotiation Email",
  negotiation_strategy: "Negotiation Strategy",
  settlement_advice: "Settlement Advice",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await dashboardService.getSummary();
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (error) return <AlertMessage type="error" message={error} />;

  const { user, loan_summary, financial_health, settlement_summary, recent_ai_history, loan_cards } = summary;

  const statusChartData = {
    labels: ["Active", "Settled", "Overdue"],
    datasets: [{
      data: [
        loan_summary.active_loans,
        loan_summary.settled_loans,
        loan_summary.overdue_loans,
      ],
      backgroundColor: ["#3b82f6", "#22c55e", "#ef4444"],
      borderWidth: 2,
    }],
  };

  const healthChartData = {
    labels: loan_cards.map((c) => c.loan_type),
    datasets: [{
      label: "Health Score",
      data: loan_cards.map((c) => c.health_score),
      backgroundColor: loan_cards.map((c) =>
        c.health_score >= 75 ? "#22c55e" :
        c.health_score >= 50 ? "#f59e0b" :
        c.health_score >= 30 ? "#f97316" : "#ef4444"
      ),
      borderRadius: 6,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 100 } },
  };

  return (
    <div className="page-container">
      {/* ── Welcome Header ───────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Welcome back, {user.full_name.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">Here&apos;s your financial recovery overview</p>
        </div>
        <Link to="/loans/add" className="btn btn-primary">+ Add Loan</Link>
      </div>

      {/* ── Top Stats ────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard
          icon="🏦"
          label="Total Debt"
          value={formatCurrency(loan_summary.total_debt)}
          color="red"
        />
        <StatCard
          icon="📊"
          label="Total Loans"
          value={loan_summary.total_loans}
          subtitle={`${loan_summary.active_loans} active`}
          color="blue"
        />
        <StatCard
          icon="💸"
          label="Monthly EMI Burden"
          value={formatCurrency(loan_summary.total_monthly_emi)}
          color="amber"
        />
        <StatCard
          icon="💚"
          label="Avg Health Score"
          value={`${financial_health.average_health_score} / 100`}
          color="green"
        />
        <StatCard
          icon="📉"
          label="Avg DTI Ratio"
          value={`${financial_health.average_dti_ratio}%`}
          subtitle="Debt-to-Income"
          color="purple"
        />
        <StatCard
          icon="🤝"
          label="Settlement Probability"
          value={`${settlement_summary.average_settlement_probability}%`}
          subtitle={`${settlement_summary.loans_with_settlements} analyzed`}
          color="teal"
        />
      </div>

      {/* ── Charts Row ───────────────────────────────── */}
      {loan_summary.total_loans > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Loan Status Breakdown</h3>
            <div className="chart-wrapper chart-wrapper--sm">
              <Doughnut data={statusChartData} />
            </div>
          </div>
          <div className="chart-card">
            <h3>Financial Health by Loan</h3>
            <div className="chart-wrapper">
              <Bar data={healthChartData} options={barOptions} />
            </div>
          </div>
        </div>
      )}

      {/* ── Loan Cards ───────────────────────────────── */}
      {loan_cards.length > 0 ? (
        <div className="section">
          <h2 className="section-title">Your Loans</h2>
          <div className="loan-cards-grid">
            {loan_cards.map((card) => (
              <div key={card.loan_id} className="loan-card">
                <div className="loan-card__header">
                  <span className="loan-type-badge">{card.loan_type}</span>
                  <span className={`status-badge status-badge--${card.status}`}>
                    {card.status}
                  </span>
                </div>
                <div className="loan-card__body">
                  <div className="loan-amount">{formatCurrency(card.loan_amount)}</div>
                  <div className="loan-meta">
                    <span>EMI: {formatCurrency(card.emi)}</span>
                    {card.overdue_months > 0 && (
                      <span className="overdue-badge">⚠️ {card.overdue_months}m overdue</span>
                    )}
                  </div>
                </div>
                <div className="loan-card__footer">
                  <HealthScoreBadge score={card.health_score} label={card.health_label} />
                  <div className="stress-level">
                    <span className="stress-label">Stress:</span>
                    <span className={`stress-value stress--${card.debt_stress_level.toLowerCase()}`}>
                      {card.debt_stress_level}
                    </span>
                  </div>
                </div>
                <Link to={`/loans/${card.loan_id}`} className="loan-card__link">
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No loans yet</h3>
          <p>Add your first loan to get started with financial analysis</p>
          <Link to="/loans/add" className="btn btn-primary">Add Your First Loan</Link>
        </div>
      )}

      {/* ── Recent AI History ────────────────────────── */}
      {recent_ai_history.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent AI Activity</h2>
            <Link to="/ai-history" className="view-all-link">View all →</Link>
          </div>
          <div className="ai-history-list">
            {recent_ai_history.map((item) => (
              <div key={item.id} className="ai-history-item">
                <div className="ai-history-item__type">
                  🤖 {contentTypeLabels[item.content_type] || item.content_type}
                </div>
                <div className="ai-history-item__preview">{item.response_preview}</div>
                <div className="ai-history-item__meta">
                  Loan #{item.loan_id} •{" "}
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { financialService } from "../services/financialService";
import HealthScoreBadge from "../components/HealthScoreBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function FinancialHealthPage() {
  const [healthReports, setHealthReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await financialService.getAllHealth();
        setHealthReports(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load health data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Analyzing your financial health..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Financial Health Analysis</h1>
          <p className="page-subtitle">Detailed financial indicators for all your loans</p>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {healthReports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No loans to analyze</h3>
          <p>Add a loan first to see your financial health report</p>
          <Link to="/loans/add" className="btn btn-primary">Add Loan</Link>
        </div>
      ) : (
        <div className="health-reports-grid">
          {healthReports.map((report) => (
            <div key={report.loan_id} className="health-report-card">
              <div className="health-report-card__header">
                <div>
                  <h3>{report.loan_type}</h3>
                  <span className="loan-amount-tag">{formatCurrency(report.loan_amount)}</span>
                </div>
                <HealthScoreBadge
                  score={report.financial_health_score}
                  label={report.health_label}
                />
              </div>

              <div className="health-metrics-grid">
                <div className="health-metric">
                  <div className="metric-label">Monthly Surplus</div>
                  <div className={`metric-value ${report.monthly_surplus >= 0 ? "positive" : "negative"}`}>
                    {formatCurrency(report.monthly_surplus)}
                  </div>
                </div>
                <div className="health-metric">
                  <div className="metric-label">DTI Ratio</div>
                  <div className={`metric-value ${report.debt_to_income_ratio <= 40 ? "positive" : "negative"}`}>
                    {report.debt_to_income_ratio}%
                  </div>
                </div>
                <div className="health-metric">
                  <div className="metric-label">EMI Burden</div>
                  <div className="metric-value">{report.emi_status}</div>
                  <div className="metric-sub">{report.emi_burden_percent}% of income</div>
                </div>
                <div className="health-metric">
                  <div className="metric-label">Debt Stress</div>
                  <div className={`metric-value stress--${report.debt_stress_level.toLowerCase()}`}>
                    {report.debt_stress_level}
                  </div>
                </div>
                <div className="health-metric">
                  <div className="metric-label">Recommended Savings</div>
                  <div className="metric-value">{formatCurrency(report.recommended_savings)}/mo</div>
                </div>
                <div className="health-metric">
                  <div className="metric-label">Savings Gap</div>
                  <div className={`metric-value ${report.savings_gap > 0 ? "negative" : "positive"}`}>
                    {report.savings_gap > 0
                      ? `−${formatCurrency(report.savings_gap)}`
                      : "On Track ✅"}
                  </div>
                </div>
              </div>

              <div className="health-report-card__footer">
                <Link to={`/loans/${report.loan_id}`} className="btn btn-outline btn-sm">
                  View Full Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { loanService } from "../services/loanService";
import { financialService } from "../services/financialService";
import { aiService } from "../services/aiService";
import HealthScoreBadge from "../components/HealthScoreBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const AI_TYPES = [
  { value: "settlement_advice", label: "Settlement Advice", icon: "💡" },
  { value: "settlement_letter", label: "Settlement Letter", icon: "📄" },
  { value: "negotiation_email", label: "Negotiation Email", icon: "📧" },
  { value: "negotiation_strategy", label: "Negotiation Strategy", icon: "🎯" },
];

export default function LoanDetailPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [health, setHealth] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [selectedAiType, setSelectedAiType] = useState("settlement_advice");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [loanData, healthData] = await Promise.all([
          loanService.getLoanById(loanId),
          financialService.getHealthByLoan(loanId),
        ]);
        setLoan(loanData);
        setHealth(healthData);
        try {
          const settlementData = await financialService.getSettlement(loanId);
          setSettlement(settlementData);
        } catch {
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load loan details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  const handleComputeSettlement = async () => {
    setSettlementLoading(true);
    try {
      const data = await financialService.computeSettlement(loanId);
      setSettlement(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to compute settlement");
    } finally {
      setSettlementLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiError("");
    setAiContent(null);
    try {
      const data = await aiService.generateContent(loanId, selectedAiType, additionalContext || null);
      setAiContent(data);
    } catch (err) {
      setAiError(err.response?.data?.detail || "AI generation failed. Check Gemini API key.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading loan details..." />;
  if (!loan) return <AlertMessage type="error" message="Loan not found" />;

  const getHealthColor = (score) =>
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444";

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>{loan.loan_type}</h1>
          <p className="page-subtitle">Loan #{loan.id} • Added {new Date(loan.created_at).toLocaleDateString()}</p>
        </div>
        <div className="header-actions">
          <Link to={`/loans/${loanId}/edit`} className="btn btn-outline">✏️ Edit</Link>
          <Link to="/loans" className="btn btn-outline">← Back</Link>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      <div className="detail-grid">
        {/* ── Loan Info Card ──────────────────────────── */}
        <div className="detail-card">
          <h3>📋 Loan Details</h3>
          <div className="detail-rows">
            <div className="detail-row">
              <span>Loan Amount</span>
              <strong>{formatCurrency(loan.loan_amount)}</strong>
            </div>
            <div className="detail-row">
              <span>Interest Rate</span>
              <strong>{loan.interest_rate}% p.a.</strong>
            </div>
            <div className="detail-row">
              <span>Monthly EMI</span>
              <strong>{formatCurrency(loan.emi)}</strong>
            </div>
            <div className="detail-row">
              <span>Monthly Income</span>
              <strong>{formatCurrency(loan.monthly_income)}</strong>
            </div>
            <div className="detail-row">
              <span>Overdue Months</span>
              <strong className={loan.overdue_months > 0 ? "text-danger" : "text-success"}>
                {loan.overdue_months === 0 ? "✅ Current" : `⚠️ ${loan.overdue_months} months`}
              </strong>
            </div>
            <div className="detail-row">
              <span>Status</span>
              <span className={`status-badge status-badge--${loan.status}`}>{loan.status}</span>
            </div>
          </div>
        </div>

        {/* ── Financial Health Card ───────────────────── */}
        {health && (
          <div className="detail-card">
            <h3>📊 Financial Health</h3>
            <div className="health-center">
              <HealthScoreBadge score={health.financial_health_score} label={health.health_label} />
            </div>
            <div className="detail-rows">
              <div className="detail-row">
                <span>Monthly Surplus</span>
                <strong className={health.monthly_surplus >= 0 ? "text-success" : "text-danger"}>
                  {formatCurrency(health.monthly_surplus)}
                </strong>
              </div>
              <div className="detail-row">
                <span>Debt-to-Income Ratio</span>
                <strong>{health.debt_to_income_ratio}%</strong>
              </div>
              <div className="detail-row">
                <span>EMI Burden</span>
                <strong>{health.emi_status} ({health.emi_burden_percent}%)</strong>
              </div>
              <div className="detail-row">
                <span>Debt Stress Level</span>
                <strong className={`stress--${health.debt_stress_level.toLowerCase()}`}>
                  {health.debt_stress_level}
                </strong>
              </div>
              <div className="detail-row">
                <span>Recommended Savings</span>
                <strong>{formatCurrency(health.recommended_savings)}/mo</strong>
              </div>
              <div className="detail-row">
                <span>Savings Gap</span>
                <strong className={health.savings_gap > 0 ? "text-danger" : "text-success"}>
                  {health.savings_gap > 0 ? `−${formatCurrency(health.savings_gap)}` : "On track ✅"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* ── Settlement Card ─────────────────────────── */}
        <div className="detail-card">
          <h3>🤝 Settlement Recommendation</h3>
          {settlement ? (
            <div className="detail-rows">
              <div className="detail-row">
                <span>Recommended Amount</span>
                <strong className="text-primary">{formatCurrency(settlement.recommended_amount)}</strong>
              </div>
              <div className="detail-row">
                <span>Settlement Percentage</span>
                <strong>{settlement.percentage}% of loan</strong>
              </div>
              <div className="detail-row">
                <span>Success Probability</span>
                <strong
                  style={{
                    color: settlement.probability >= 70 ? "#22c55e"
                      : settlement.probability >= 50 ? "#f59e0b" : "#ef4444"
                  }}
                >
                  {settlement.probability}%
                </strong>
              </div>
              {settlement.remarks && (
                <div className="detail-remark">
                  <p>{settlement.remarks}</p>
                </div>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={handleComputeSettlement}
                disabled={settlementLoading}
              >
                {settlementLoading ? "Recalculating..." : "🔄 Recalculate"}
              </button>
            </div>
          ) : (
            <div className="empty-action">
              <p>No settlement analysis yet. Run the engine to get recommendations.</p>
              <button
                className="btn btn-primary"
                onClick={handleComputeSettlement}
                disabled={settlementLoading}
              >
                {settlementLoading ? "Analyzing..." : "⚡ Compute Settlement"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Negotiation Section ──────────────────────── */}
      <div className="section">
        <h2 className="section-title">🤖 AI Negotiation Engine</h2>
        <div className="ai-generator-card">
          <div className="ai-type-selector">
            {AI_TYPES.map((type) => (
              <button
                key={type.value}
                className={`ai-type-btn ${selectedAiType === type.value ? "active" : ""}`}
                onClick={() => setSelectedAiType(type.value)}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label>Additional Context (optional)</label>
            <textarea
              placeholder="e.g., I lost my job 3 months ago and have medical bills..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              className="context-textarea"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerateAI}
            disabled={aiLoading}
          >
            {aiLoading ? "✨ Generating with Gemini AI..." : "✨ Generate with Gemini AI"}
          </button>

          <AlertMessage type="error" message={aiError} onClose={() => setAiError("")} />

          {aiLoading && (
            <div className="ai-loading">
              <div className="spinner spinner--sm"></div>
              <span>Gemini is crafting your content...</span>
            </div>
          )}

          {aiContent && (
            <div className="ai-result">
              <div className="ai-result__header">
                <h4>
                  {AI_TYPES.find((t) => t.value === aiContent.content_type)?.icon}{" "}
                  {AI_TYPES.find((t) => t.value === aiContent.content_type)?.label}
                </h4>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigator.clipboard.writeText(aiContent.response)}
                >
                  📋 Copy
                </button>
              </div>
              <pre className="ai-result__text">{aiContent.response}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

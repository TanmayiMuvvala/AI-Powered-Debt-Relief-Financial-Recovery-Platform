import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { financialService } from "../services/financialService";
import { loanService } from "../services/loanService";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function SettlementsPage() {
  const [loans, setLoans] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [loansData, settlementsData] = await Promise.all([
          loanService.getAllLoans(),
          financialService.getAllSettlements(),
        ]);
        setLoans(loansData);
        setSettlements(settlementsData);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCompute = async (loanId) => {
    setComputing(loanId);
    try {
      const data = await financialService.computeSettlement(loanId);
      setSettlements((prev) => {
        const existing = prev.find((s) => s.loan_id === loanId);
        if (existing) return prev.map((s) => (s.loan_id === loanId ? data : s));
        return [...prev, data];
      });
      setSuccessMsg("Settlement computed successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to compute settlement");
    } finally {
      setComputing(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settlements..." />;

  const getSettlementForLoan = (loanId) => settlements.find((s) => s.loan_id === loanId);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Settlement Recommendations</h1>
          <p className="page-subtitle">AI-powered settlement analysis for each loan</p>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg("")} />

      {loans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤝</div>
          <h3>No loans to analyze</h3>
          <Link to="/loans/add" className="btn btn-primary">Add Loan</Link>
        </div>
      ) : (
        <div className="settlements-grid">
          {loans.map((loan) => {
            const settlement = getSettlementForLoan(loan.id);
            return (
              <div key={loan.id} className="settlement-card">
                <div className="settlement-card__header">
                  <h3>{loan.loan_type}</h3>
                  <span className={`status-badge status-badge--${loan.status}`}>{loan.status}</span>
                </div>
                <div className="settlement-card__loan-info">
                  <span>Loan: {formatCurrency(loan.loan_amount)}</span>
                  {loan.overdue_months > 0 && (
                    <span className="overdue-badge">⚠️ {loan.overdue_months}m overdue</span>
                  )}
                </div>

                {settlement ? (
                  <div className="settlement-result">
                    <div className="settlement-highlight">
                      <div className="settlement-amount">{formatCurrency(settlement.recommended_amount)}</div>
                      <div className="settlement-label">Recommended Settlement</div>
                    </div>
                    <div className="settlement-details">
                      <div className="settlement-detail-row">
                        <span>Settlement %</span>
                        <strong>{settlement.percentage}% of loan</strong>
                      </div>
                      <div className="settlement-detail-row">
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
                    </div>
                    {settlement.remarks && (
                      <p className="settlement-remarks">{settlement.remarks.substring(0, 150)}...</p>
                    )}
                    <div className="settlement-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleCompute(loan.id)}
                        disabled={computing === loan.id}
                      >
                        {computing === loan.id ? "Recalculating..." : "🔄 Recalculate"}
                      </button>
                      <Link to={`/loans/${loan.id}`} className="btn btn-primary btn-sm">
                        AI Negotiation →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="settlement-empty">
                    <p>Settlement analysis not run yet.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCompute(loan.id)}
                      disabled={computing === loan.id}
                    >
                      {computing === loan.id ? "Analyzing..." : "⚡ Compute Settlement"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loanService } from "../services/loanService";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadLoans = async () => {
    try {
      const data = await loanService.getAllLoans();
      setLoans(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLoans(); }, []);

  const handleDelete = async (loanId) => {
    if (!window.confirm("Delete this loan and all its data? This cannot be undone.")) return;

    setDeletingId(loanId);
    try {
      await loanService.deleteLoan(loanId);
      setSuccessMsg("Loan deleted successfully");
      setLoans(loans.filter((l) => l.id !== loanId));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete loan");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your loans..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Loan Management</h1>
          <p className="page-subtitle">Track and manage all your loan accounts</p>
        </div>
        <Link to="/loans/add" className="btn btn-primary">+ Add Loan</Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg("")} />

      {loans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h3>No loans added yet</h3>
          <p>Add your loan accounts to begin debt analysis</p>
          <Link to="/loans/add" className="btn btn-primary">Add First Loan</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>EMI</th>
                <th>Income</th>
                <th>Overdue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <strong>{loan.loan_type}</strong>
                    <div className="table-sub">ID: #{loan.id}</div>
                  </td>
                  <td>{formatCurrency(loan.loan_amount)}</td>
                  <td>{loan.interest_rate}%</td>
                  <td>{formatCurrency(loan.emi)}</td>
                  <td>{formatCurrency(loan.monthly_income)}</td>
                  <td>
                    {loan.overdue_months > 0 ? (
                      <span className="overdue-badge">⚠️ {loan.overdue_months}m</span>
                    ) : (
                      <span className="text-success">✅ Current</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${loan.status}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/loans/${loan.id}`} className="btn-action btn-view" title="View Details">
                        👁
                      </Link>
                      <Link to={`/loans/${loan.id}/edit`} className="btn-action btn-edit" title="Edit">
                        ✏️
                      </Link>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(loan.id)}
                        disabled={deletingId === loan.id}
                        title="Delete"
                      >
                        {deletingId === loan.id ? "..." : "🗑"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

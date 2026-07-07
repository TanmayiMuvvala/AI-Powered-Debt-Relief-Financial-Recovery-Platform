import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loanService } from "../services/loanService";
import AlertMessage from "../components/AlertMessage";
import LoadingSpinner from "../components/LoadingSpinner";

const LOAN_TYPES = [
  "Personal Loan", "Home Loan", "Car Loan",
  "Business Loan", "Education Loan", "Credit Card", "Other"
];

export default function EditLoanPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const loan = await loanService.getLoanById(loanId);
        setForm({
          loan_type: loan.loan_type,
          loan_amount: loan.loan_amount.toString(),
          interest_rate: loan.interest_rate.toString(),
          emi: loan.emi.toString(),
          monthly_income: loan.monthly_income.toString(),
          overdue_months: loan.overdue_months.toString(),
          status: loan.status,
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load loan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        loan_type: form.loan_type,
        loan_amount: parseFloat(form.loan_amount),
        interest_rate: parseFloat(form.interest_rate),
        emi: parseFloat(form.emi),
        monthly_income: parseFloat(form.monthly_income),
        overdue_months: parseInt(form.overdue_months),
        status: form.status,
      };
      await loanService.updateLoan(loanId, payload);
      navigate(`/loans/${loanId}`, { state: { message: "Loan updated!" } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading loan..." />;
  if (!form) return <AlertMessage type="error" message="Loan not found" />;

  return (
    <div className="page-container page-container--narrow">
      <div className="page-header">
        <div>
          <h1>Edit Loan</h1>
          <p className="page-subtitle">Loan #{loanId}</p>
        </div>
        <Link to={`/loans/${loanId}`} className="btn btn-outline">← Cancel</Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      <div className="form-card">
        <form onSubmit={handleSubmit} className="loan-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Loan Type</label>
              <select name="loan_type" value={form.loan_type} onChange={handleChange}>
                {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Loan Amount (₹)</label>
              <input type="number" name="loan_amount" value={form.loan_amount} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group">
              <label>Interest Rate (%)</label>
              <input type="number" name="interest_rate" value={form.interest_rate} onChange={handleChange} min="0.1" max="100" step="0.1" required />
            </div>
            <div className="form-group">
              <label>Monthly EMI (₹)</label>
              <input type="number" name="emi" value={form.emi} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group">
              <label>Monthly Income (₹)</label>
              <input type="number" name="monthly_income" value={form.monthly_income} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group">
              <label>Months Overdue</label>
              <input type="number" name="overdue_months" value={form.overdue_months} onChange={handleChange} min="0" required />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="settled">Settled</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <Link to={`/loans/${loanId}`} className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

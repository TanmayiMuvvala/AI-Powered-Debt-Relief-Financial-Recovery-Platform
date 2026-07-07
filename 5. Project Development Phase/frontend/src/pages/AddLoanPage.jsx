import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loanService } from "../services/loanService";
import AlertMessage from "../components/AlertMessage";

const LOAN_TYPES = [
  "Personal Loan", "Home Loan", "Car Loan",
  "Business Loan", "Education Loan", "Credit Card", "Other"
];

export default function AddLoanPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    loan_type: "Personal Loan",
    loan_amount: "",
    interest_rate: "",
    emi: "",
    monthly_income: "",
    overdue_months: "0",
    status: "active",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        loan_amount: parseFloat(form.loan_amount),
        interest_rate: parseFloat(form.interest_rate),
        emi: parseFloat(form.emi),
        monthly_income: parseFloat(form.monthly_income),
        overdue_months: parseInt(form.overdue_months),
      };

      await loanService.createLoan(payload);
      navigate("/loans", { state: { message: "Loan added successfully!" } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(", "));
      } else {
        setError(detail || "Failed to add loan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-container--narrow">
      <div className="page-header">
        <div>
          <h1>Add New Loan</h1>
          <p className="page-subtitle">Enter your loan details for financial analysis</p>
        </div>
        <Link to="/loans" className="btn btn-outline">← Back</Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      <div className="form-card">
        <form onSubmit={handleSubmit} className="loan-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="loan_type">Loan Type *</label>
              <select
                id="loan_type"
                name="loan_type"
                value={form.loan_type}
                onChange={handleChange}
                required
              >
                {LOAN_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="loan_amount">Loan Amount (₹) *</label>
              <input
                id="loan_amount"
                type="number"
                name="loan_amount"
                placeholder="e.g. 500000"
                value={form.loan_amount}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="interest_rate">Annual Interest Rate (%) *</label>
              <input
                id="interest_rate"
                type="number"
                name="interest_rate"
                placeholder="e.g. 12.5"
                value={form.interest_rate}
                onChange={handleChange}
                min="0.1"
                max="100"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="emi">Monthly EMI (₹) *</label>
              <input
                id="emi"
                type="number"
                name="emi"
                placeholder="e.g. 15000"
                value={form.emi}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="monthly_income">Monthly Income (₹) *</label>
              <input
                id="monthly_income"
                type="number"
                name="monthly_income"
                placeholder="e.g. 50000"
                value={form.monthly_income}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="overdue_months">Months Overdue</label>
              <input
                id="overdue_months"
                type="number"
                name="overdue_months"
                placeholder="0 if current"
                value={form.overdue_months}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Loan Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="settled">Settled</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/loans" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding Loan..." : "Add Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

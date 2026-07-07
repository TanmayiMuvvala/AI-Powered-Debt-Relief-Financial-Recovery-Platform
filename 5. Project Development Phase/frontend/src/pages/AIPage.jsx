import { useState, useEffect } from "react";
import { loanService } from "../services/loanService";
import { aiService } from "../services/aiService";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";
import { Link } from "react-router-dom";

const AI_TYPES = [
  {
    value: "settlement_advice",
    label: "Settlement Advice",
    icon: "💡",
    description: "Plain-language assessment of your settlement options",
  },
  {
    value: "settlement_letter",
    label: "Settlement Letter",
    icon: "📄",
    description: "Formal debt settlement request letter for your lender",
  },
  {
    value: "negotiation_email",
    label: "Negotiation Email",
    icon: "📧",
    description: "Professional email to initiate settlement negotiation",
  },
  {
    value: "negotiation_strategy",
    label: "Negotiation Strategy",
    icon: "🎯",
    description: "Step-by-step strategic plan for debt negotiation",
  },
];

export default function AIPage() {
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedType, setSelectedType] = useState("settlement_advice");
  const [additionalContext, setAdditionalContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loanService.getAllLoans();
        setLoans(data);
        if (data.length > 0) setSelectedLoanId(data[0].id.toString());
      } catch {
        setError("Failed to load loans");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    if (!selectedLoanId) return;
    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const data = await aiService.generateContent(
        parseInt(selectedLoanId),
        selectedType,
        additionalContext || null
      );
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "AI generation failed. Ensure your Gemini API key is set.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>AI Negotiation Engine</h1>
          <p className="page-subtitle">Powered by Google Gemini AI</p>
        </div>
        <Link to="/ai-history" className="btn btn-outline">📋 View History</Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {loans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h3>No loans found</h3>
          <p>Add a loan first to use the AI Negotiation Engine</p>
          <Link to="/loans/add" className="btn btn-primary">Add Loan</Link>
        </div>
      ) : (
        <div className="ai-hub-layout">
          {/* ── Left Panel: Config ──────────────────────── */}
          <div className="ai-hub-config">
            <div className="form-card">
              <h3>Configure Generation</h3>

              <div className="form-group">
                <label>Select Loan</label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                >
                  {loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.loan_type} — ₹{loan.loan_amount.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Content Type</label>
                <div className="ai-type-cards">
                  {AI_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`ai-type-card ${selectedType === type.value ? "active" : ""}`}
                      onClick={() => setSelectedType(type.value)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedType(type.value)}
                    >
                      <div className="ai-type-card__icon">{type.icon}</div>
                      <div className="ai-type-card__text">
                        <div className="ai-type-card__label">{type.label}</div>
                        <div className="ai-type-card__desc">{type.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Additional Context (optional)</label>
                <textarea
                  placeholder="e.g., I lost my job 3 months ago. I have medical expenses of ₹50,000. I am a single parent..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={4}
                  className="context-textarea"
                />
                <small>More context = better AI output</small>
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={handleGenerate}
                disabled={generating || !selectedLoanId}
              >
                {generating ? "✨ Generating..." : "✨ Generate with Gemini AI"}
              </button>
            </div>
          </div>

          {/* ── Right Panel: Output ─────────────────────── */}
          <div className="ai-hub-output">
            {generating ? (
              <div className="ai-generating">
                <div className="ai-pulse">🤖</div>
                <h3>Gemini is thinking...</h3>
                <p>Crafting professional content based on your loan data</p>
                <div className="spinner"></div>
              </div>
            ) : result ? (
              <div className="ai-result-full">
                <div className="ai-result-full__header">
                  <div>
                    <span className="content-type-badge">
                      {AI_TYPES.find((t) => t.value === result.content_type)?.icon}{" "}
                      {AI_TYPES.find((t) => t.value === result.content_type)?.label}
                    </span>
                    <span className="ai-timestamp">
                      Generated {new Date(result.created_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigator.clipboard.writeText(result.response)}
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
                <pre className="ai-result-full__text">{result.response}</pre>
              </div>
            ) : (
              <div className="ai-placeholder">
                <div className="ai-placeholder__icon">✨</div>
                <h3>Ready to Generate</h3>
                <p>Select your loan, choose content type, and click Generate.</p>
                <p className="ai-placeholder__hint">
                  Tip: Add additional context about your situation for better results.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { aiService } from "../services/aiService";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";

const CONTENT_TYPE_LABELS = {
  settlement_letter: { label: "Settlement Letter", icon: "📄", color: "blue" },
  negotiation_email: { label: "Negotiation Email", icon: "📧", color: "purple" },
  negotiation_strategy: { label: "Negotiation Strategy", icon: "🎯", color: "amber" },
  settlement_advice: { label: "Settlement Advice", icon: "💡", color: "green" },
};

export default function AIHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await aiService.getAllHistory();
        setHistory(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load AI history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filterType === "all"
    ? history
    : history.filter((h) => h.content_type === filterType);

  if (loading) return <LoadingSpinner message="Loading AI history..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>AI Generation History</h1>
          <p className="page-subtitle">{history.length} AI-generated documents across all loans</p>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {/* ── Filter Tabs ──────────────────────────────── */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterType === "all" ? "active" : ""}`}
          onClick={() => setFilterType("all")}
        >
          All ({history.length})
        </button>
        {Object.entries(CONTENT_TYPE_LABELS).map(([type, { label, icon }]) => (
          <button
            key={type}
            className={`filter-tab ${filterType === type ? "active" : ""}`}
            onClick={() => setFilterType(type)}
          >
            {icon} {label} ({history.filter((h) => h.content_type === type).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h3>No AI content generated yet</h3>
          <p>Go to a loan and use the AI Negotiation Engine to generate content</p>
          <Link to="/loans" className="btn btn-primary">Go to Loans</Link>
        </div>
      ) : (
        <div className="ai-history-full">
          {filtered.map((item) => {
            const meta = CONTENT_TYPE_LABELS[item.content_type] || {
              label: item.content_type, icon: "🤖", color: "gray"
            };
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="ai-history-card">
                <div
                  className="ai-history-card__header"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setExpandedId(isExpanded ? null : item.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="ai-history-card__meta">
                    <span className={`content-type-badge badge--${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="ai-loan-ref">Loan #{item.loan_id}</span>
                    <span className="ai-date">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                  <span className="expand-icon">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {isExpanded && (
                  <div className="ai-history-card__body">
                    <div className="ai-response-block">
                      <div className="ai-response-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => navigator.clipboard.writeText(item.response)}
                        >
                          📋 Copy
                        </button>
                        <Link to={`/loans/${item.loan_id}`} className="btn btn-outline btn-sm">
                          View Loan →
                        </Link>
                      </div>
                      <pre className="ai-response-text">{item.response}</pre>
                    </div>
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

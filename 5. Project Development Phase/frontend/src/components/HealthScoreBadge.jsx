export default function HealthScoreBadge({ score, label }) {
  const getColor = (s) => {
    if (s >= 75) return "#22c55e";  
    if (s >= 50) return "#f59e0b";  
    if (s >= 30) return "#f97316";  
    return "#ef4444";              
  };

  const color = getColor(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="health-badge">
      <svg width="100" height="100" viewBox="0 0 100 100" aria-label={`Health score: ${score}`}>
        {/* Background circle */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        {/* Score text */}
        <text x="50" y="46" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x="50" y="62" textAnchor="middle" fontSize="9" fill="#6b7280">
          / 100
        </text>
      </svg>
      <div className="health-badge__label" style={{ color }}>
        {label}
      </div>
    </div>
  );
}

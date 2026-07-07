
export default function AlertMessage({ type = "error", message, onClose }) {
  if (!message) return null;

  const icons = { error: "❌", success: "✅", warning: "⚠️", info: "ℹ️" };

  return (
    <div className={`alert alert--${type}`} role="alert">
      <span className="alert__icon">{icons[type]}</span>
      <span className="alert__message">{message}</span>
      {onClose && (
        <button className="alert__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}

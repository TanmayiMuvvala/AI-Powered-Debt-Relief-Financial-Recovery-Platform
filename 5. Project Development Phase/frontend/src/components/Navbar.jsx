import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">💰</span>
          <span className="brand-text">DebtRelief AI</span>
        </Link>
      </div>

      {isAuthenticated ? (
        <>
          <ul className="nav-links">
            <li><Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link></li>
            <li><Link to="/loans" className={isActive("/loans")}>Loans</Link></li>
            <li><Link to="/financial-health" className={isActive("/financial-health")}>Health</Link></li>
            <li><Link to="/settlements" className={isActive("/settlements")}>Settlements</Link></li>
            <li><Link to="/ai-negotiation" className={isActive("/ai-negotiation")}>AI Negotiation</Link></li>
            <li><Link to="/ai-history" className={isActive("/ai-history")}>AI History</Link></li>
          </ul>
          <div className="nav-user">
            <span className="user-name">👤 {user?.full_name}</span>
            <button className="btn btn-outline-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="nav-auth">
          <Link to="/login" className="btn btn-outline-sm">Login</Link>
          <Link to="/register" className="btn btn-primary-sm">Register</Link>
        </div>
      )}
    </nav>
  );
}

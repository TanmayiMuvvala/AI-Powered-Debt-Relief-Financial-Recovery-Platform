import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LoansPage from "./pages/LoansPage";
import AddLoanPage from "./pages/AddLoanPage";
import EditLoanPage from "./pages/EditLoanPage";
import LoanDetailPage from "./pages/LoanDetailPage";
import FinancialHealthPage from "./pages/FinancialHealthPage";
import SettlementsPage from "./pages/SettlementsPage";
import AIPage from "./pages/AIPage";
import AIHistoryPage from "./pages/AIHistoryPage";

import "./index.css";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/loans"
              element={<ProtectedRoute><LoansPage /></ProtectedRoute>}
            />
            <Route
              path="/loans/add"
              element={<ProtectedRoute><AddLoanPage /></ProtectedRoute>}
            />
            <Route
              path="/loans/:loanId/edit"
              element={<ProtectedRoute><EditLoanPage /></ProtectedRoute>}
            />
            <Route
              path="/loans/:loanId"
              element={<ProtectedRoute><LoanDetailPage /></ProtectedRoute>}
            />
            <Route
              path="/financial-health"
              element={<ProtectedRoute><FinancialHealthPage /></ProtectedRoute>}
            />
            <Route
              path="/settlements"
              element={<ProtectedRoute><SettlementsPage /></ProtectedRoute>}
            />
            <Route
              path="/ai-negotiation"
              element={<ProtectedRoute><AIPage /></ProtectedRoute>}
            />
            <Route
              path="/ai-history"
              element={<ProtectedRoute><AIHistoryPage /></ProtectedRoute>}
            />

            {/* Default redirect */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

# AI Powered Debt Relief & Financial Recovery Platform — Frontend

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```
Frontend runs at: http://localhost:5173

### 3. Build for production
```bash
npm run build
```

---

## Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| / | Landing Page | No |
| /login | Login | No |
| /register | Register | No |
| /dashboard | Dashboard | Yes |
| /loans | Loan List | Yes |
| /loans/add | Add Loan | Yes |
| /loans/:id | Loan Detail + AI | Yes |
| /loans/:id/edit | Edit Loan | Yes |
| /financial-health | Health Analysis | Yes |
| /settlements | Settlements | Yes |
| /ai-negotiation | AI Engine Hub | Yes |
| /ai-history | AI History | Yes |

---

## Project Structure
```
frontend/src/
├── App.jsx              # Router + layout wrapper
├── main.jsx             # Entry point
├── index.css            # Global styles
├── context/
│   └── AuthContext.jsx  # JWT auth state + hooks
├── services/
│   ├── api.js           # Axios instance (auto-attach Bearer token)
│   ├── authService.js   # Auth API calls
│   ├── loanService.js   # Loan CRUD calls
│   ├── financialService.js  # Health + settlement calls
│   ├── aiService.js     # AI generation calls
│   └── dashboardService.js  # Dashboard calls
├── components/
│   ├── Navbar.jsx       # Navigation bar
│   ├── ProtectedRoute.jsx  # Auth guard
│   ├── StatCard.jsx     # KPI stat display card
│   ├── LoadingSpinner.jsx  # Loading indicator
│   ├── AlertMessage.jsx # Error/success alerts
│   └── HealthScoreBadge.jsx  # Circular health score SVG
└── pages/
    ├── LandingPage.jsx  # Public home page
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── DashboardPage.jsx     # Charts + summary
    ├── LoansPage.jsx         # Loan table
    ├── AddLoanPage.jsx
    ├── EditLoanPage.jsx
    ├── LoanDetailPage.jsx    # Health + Settlement + AI
    ├── FinancialHealthPage.jsx
    ├── SettlementsPage.jsx
    ├── AIPage.jsx            # AI generation hub
    └── AIHistoryPage.jsx
```

---

## Technology
- **React 19** + **Vite 8**
- **React Router v6** — client-side routing
- **Axios** — HTTP client with JWT interceptor
- **Chart.js + react-chartjs-2** — Doughnut and Bar charts

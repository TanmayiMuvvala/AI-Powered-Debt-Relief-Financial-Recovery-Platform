# AI Powered Debt Relief & Financial Recovery Platform — Backend

## Overview
Production-quality FastAPI backend powering all financial analysis, settlement recommendations, and Google Gemini AI negotiation features.

---

## Quick Start

### 1. Activate virtual environment
```bash
# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Configure environment
Edit `.env` and set your real values:
```env
SECRET_KEY=your_super_secret_jwt_key_here_min_32_chars
GEMINI_API_KEY=your_google_gemini_api_key_here
DATABASE_URL=sqlite:///./debt_relief.db
```

Get a free Gemini API key: https://aistudio.google.com/app/apikey

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the server
```bash
uvicorn main:app --reload --port 8000
```

### 5. Open API docs
- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login, get JWT token |
| GET  | /auth/me | Get current user |
| POST | /loans/ | Add a loan |
| GET  | /loans/ | List all loans |
| GET  | /loans/{id} | Get single loan |
| PUT  | /loans/{id} | Update loan |
| DELETE | /loans/{id} | Delete loan |
| GET  | /financial-health/{loan_id} | Health analysis for loan |
| GET  | /financial-health/all | Health for all loans |
| POST | /settlements/{loan_id}/compute | Run settlement engine |
| GET  | /settlements/{loan_id} | Get settlement result |
| GET  | /settlements/all | All settlements for user |
| POST | /ai/{loan_id}/generate | Generate AI content (Gemini) |
| GET  | /ai/{loan_id}/history | AI history for loan |
| GET  | /ai/history/all | All AI history |
| GET  | /dashboard/summary | Full dashboard data |

---

## Project Structure
```
backend/
├── main.py                    # App entry point
├── requirements.txt           # Dependencies
├── .env                       # Config (never commit)
└── app/
    ├── core/
    │   ├── auth.py            # JWT creation + get_current_user dependency
    │   └── security.py        # bcrypt password hashing
    ├── databases/
    │   ├── database.py        # SQLAlchemy engine + session
    │   └── base.py            # Model registration
    ├── models/
    │   ├── user.py            # User ORM model
    │   ├── loan.py            # Loan ORM model
    │   ├── settlement.py      # Settlement ORM model
    │   └── ai_history.py      # AI History ORM model
    ├── schemas/
    │   ├── user.py            # User Pydantic schemas
    │   ├── loan.py            # Loan Pydantic schemas
    │   ├── settlement.py      # Settlement + FinancialHealth schemas
    │   └── ai_history.py      # AI History schemas
    ├── services/
    │   ├── user_service.py        # User CRUD logic
    │   ├── loan_service.py        # Loan CRUD logic
    │   ├── financial_health_service.py  # Health score algorithm
    │   ├── settlement_service.py  # Settlement engine
    │   └── ai_service.py          # Gemini AI integration
    ├── routers/
    │   ├── auth.py            # Auth routes
    │   ├── loans.py           # Loan routes
    │   ├── financial_health.py # Health routes
    │   ├── settlements.py     # Settlement routes
    │   ├── ai_negotiation.py  # AI routes
    │   └── dashboard.py       # Dashboard route
    └── utils/
        └── formatters.py      # Financial formatting helpers
```

---

## Architecture
```
HTTP Request
    ↓
FastAPI Router (validation via Pydantic)
    ↓
Service Layer (business logic)
    ↓
ORM Model (SQLAlchemy)
    ↓
SQLite Database
```

AI calls go through: Router → ai_service → Google Gemini API → ai_history table

---

## Technology
- **FastAPI 0.138** — async REST framework
- **SQLAlchemy 2.0** — ORM with relationship support
- **SQLite** — embedded database (swap to PostgreSQL for production)
- **google-genai 2.10** — Google Gemini AI SDK (gemini-2.0-flash model)
- **python-jose** — JWT tokens
- **bcrypt** — password hashing (12 rounds)
- **Pydantic v2** — request/response validation

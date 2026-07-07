# ============================================================
# main.py - FastAPI Application Entry Point
# Responsibility: Creates the FastAPI app, registers all
# routers, configures CORS, and triggers DB table creation.
#
# Run with:
#   uvicorn main:app --reload --port 8000
# API Docs:
#   http://localhost:8000/docs  (Swagger UI)
#   http://localhost:8000/redoc (ReDoc)
# ============================================================

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment config
load_dotenv()

# Import database base + models to ensure tables are created
from app.databases.database import engine
from app.databases.base import Base  # registers all models

# Import all routers
from app.routers.auth import router as auth_router
from app.routers.loans import router as loans_router
from app.routers.financial_health import router as financial_health_router
from app.routers.settlements import router as settlements_router
from app.routers.ai_negotiation import router as ai_router
from app.routers.dashboard import router as dashboard_router

# Create all database tables (idempotent — safe to run on every startup)
Base.metadata.create_all(bind=engine)

# ── App Configuration ─────────────────────────────────────────
app = FastAPI(
    title="AI Powered Debt Relief & Financial Recovery Platform",
    description=(
        "A production-quality platform that helps borrowers manage debt, "
        "analyze financial health, generate settlement recommendations, "
        "and create AI-powered negotiation strategies using Google Gemini AI."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ───────────────────────────────────────────
# Allow React frontend (Vite dev server) to make API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow all origins for local development
    allow_credentials=False,    # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──────────────────────────────────────────
app.include_router(auth_router)
app.include_router(loans_router)
app.include_router(financial_health_router)
app.include_router(settlements_router)
app.include_router(ai_router)
app.include_router(dashboard_router)


# ── Health Check Endpoint ─────────────────────────────────────
@app.get("/", tags=["Health Check"])
def root():
    """Root endpoint — confirms API is running."""
    return {
        "status": "running",
        "message": "AI Powered Debt Relief & Financial Recovery Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.databases.database import get_db
from app.services.loan_service import get_loans_by_user
from app.services.financial_health_service import calculate_financial_health
from app.models.settlement import Settlement
from app.models.ai_history import AIHistory
from app.models.loan import Loan
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/summary",
    summary="Get complete dashboard summary for current user"
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loans: List[Loan] = get_loans_by_user(db, current_user.id)
    loan_ids = [loan.id for loan in loans]

    total_loans = len(loans)
    total_debt = sum(loan.loan_amount for loan in loans)
    total_emi = sum(loan.emi for loan in loans)
    active_loans = sum(1 for loan in loans if loan.status == "active")
    settled_loans = sum(1 for loan in loans if loan.status == "settled")
    overdue_loans = sum(1 for loan in loans if loan.overdue_months > 0)

    health_reports = [calculate_financial_health(loan) for loan in loans]
    avg_health_score = (
        round(sum(r.financial_health_score for r in health_reports) / len(health_reports), 2)
        if health_reports else 0.0
    )
    total_monthly_surplus = round(sum(r.monthly_surplus for r in health_reports), 2)
    avg_dti = (
        round(sum(r.debt_to_income_ratio for r in health_reports) / len(health_reports), 2)
        if health_reports else 0.0
    )
    settlements = (
        db.query(Settlement)
        .filter(Settlement.loan_id.in_(loan_ids))
        .all()
    ) if loan_ids else []

    total_recommended_settlement = round(
        sum(s.recommended_amount for s in settlements), 2
    )
    avg_settlement_probability = (
        round(sum(s.probability for s in settlements) / len(settlements), 2)
        if settlements else 0.0
    )
    recent_ai = (
        db.query(AIHistory)
        .filter(AIHistory.loan_id.in_(loan_ids))
        .order_by(AIHistory.created_at.desc())
        .limit(5)
        .all()
    ) if loan_ids else []

    recent_ai_list = [
        {
            "id": r.id,
            "loan_id": r.loan_id,
            "content_type": r.content_type,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "response_preview": r.response[:200] + "..." if len(r.response) > 200 else r.response,
        }
        for r in recent_ai
    ]

    loan_cards = [
        {
            "loan_id": loan.id,
            "loan_type": loan.loan_type,
            "loan_amount": loan.loan_amount,
            "emi": loan.emi,
            "overdue_months": loan.overdue_months,
            "status": loan.status,
            "health_score": health_reports[i].financial_health_score,
            "health_label": health_reports[i].health_label,
            "debt_stress_level": health_reports[i].debt_stress_level,
        }
        for i, loan in enumerate(loans)
    ]

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
        },
        "loan_summary": {
            "total_loans": total_loans,
            "active_loans": active_loans,
            "settled_loans": settled_loans,
            "overdue_loans": overdue_loans,
            "total_debt": total_debt,
            "total_monthly_emi": total_emi,
        },
        "financial_health": {
            "average_health_score": avg_health_score,
            "total_monthly_surplus": total_monthly_surplus,
            "average_dti_ratio": avg_dti,
        },
        "settlement_summary": {
            "loans_with_settlements": len(settlements),
            "total_recommended_settlement": total_recommended_settlement,
            "average_settlement_probability": avg_settlement_probability,
        },
        "recent_ai_history": recent_ai_list,
        "loan_cards": loan_cards,
    }

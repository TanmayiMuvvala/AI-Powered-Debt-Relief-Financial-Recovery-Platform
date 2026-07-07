from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.databases.database import get_db
from app.schemas.settlement import FinancialHealthResponse
from app.services.loan_service import get_loan_by_id, get_loans_by_user
from app.services.financial_health_service import calculate_financial_health
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/financial-health",
    tags=["Financial Health Engine"]
)


@router.get(
    "/all",
    response_model=List[FinancialHealthResponse],
    summary="Analyze all loans financial health"
)
def analyze_all_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
   
    loans = get_loans_by_user(db, current_user.id)

    if not loans:
        return []

    return [calculate_financial_health(loan) for loan in loans]


@router.get(
    "/{loan_id}",
    response_model=FinancialHealthResponse,
    summary="Analyze a specific loan's financial health"
)
def analyze_loan_health(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loan = get_loan_by_id(db, loan_id, current_user.id)

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with ID {loan_id} not found"
        )

    return calculate_financial_health(loan)

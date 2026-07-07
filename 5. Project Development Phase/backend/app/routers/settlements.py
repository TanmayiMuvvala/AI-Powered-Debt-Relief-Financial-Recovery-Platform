from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.databases.database import get_db
from app.schemas.settlement import SettlementResponse
from app.services.loan_service import get_loan_by_id, get_loans_by_user
from app.services.settlement_service import compute_and_save_settlement, get_settlement_by_loan
from app.models.settlement import Settlement
from app.models.loan import Loan
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/settlements",
    tags=["Settlement Recommendation Engine"]
)


@router.post(
    "/{loan_id}/compute",
    response_model=SettlementResponse,
    summary="Compute settlement recommendation for a loan"
)
def compute_settlement(
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

    settlement = compute_and_save_settlement(db, loan)
    return SettlementResponse.model_validate(settlement)


@router.get(
    "/all",
    response_model=List[SettlementResponse],
    summary="Get all settlement records for current user"
)
def get_all_settlements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loans = get_loans_by_user(db, current_user.id)
    loan_ids = [loan.id for loan in loans]

    settlements = (
        db.query(Settlement)
        .filter(Settlement.loan_id.in_(loan_ids))
        .all()
    )

    return [SettlementResponse.model_validate(s) for s in settlements]


@router.get(
    "/{loan_id}",
    response_model=SettlementResponse,
    summary="Get settlement recommendation for a loan"
)
def get_settlement(
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

    settlement = get_settlement_by_loan(db, loan_id)
    if not settlement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No settlement recommendation found. Run /compute first."
        )

    return SettlementResponse.model_validate(settlement)

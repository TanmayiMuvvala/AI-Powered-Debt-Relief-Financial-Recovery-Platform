
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.databases.database import get_db
from app.schemas.ai_history import AIGenerateRequest, AIHistoryResponse
from app.services.loan_service import get_loan_by_id
from app.services.ai_service import (
    generate_ai_content,
    get_ai_history_by_loan,
    get_all_ai_history_by_user
)
from app.models.ai_history import AIHistory
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/ai",
    tags=["AI Negotiation Engine"]
)


@router.post(
    "/{loan_id}/generate",
    response_model=AIHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI content for a loan"
)
def generate_content(
    loan_id: int,
    request: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loan = get_loan_by_id(db, loan_id, current_user.id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with ID {loan_id} not found"
        )

    try:
        result = generate_ai_content(
            db=db,
            loan=loan,
            content_type=request.content_type,
            additional_context=request.additional_context
        )
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


@router.get(
    "/history/all",
    response_model=List[AIHistoryResponse],
    summary="Get all AI history for current user"
)
def get_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = get_all_ai_history_by_user(db, current_user.id)
    return [AIHistoryResponse.model_validate(r) for r in records]


@router.get(
    "/{loan_id}/history",
    response_model=List[AIHistoryResponse],
    summary="Get AI history for a specific loan"
)
def get_loan_history(
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

    records = get_ai_history_by_loan(db, loan_id)
    return [AIHistoryResponse.model_validate(r) for r in records]


@router.get(
    "/history/{history_id}",
    response_model=AIHistoryResponse,
    summary="Get a specific AI history record"
)
def get_history_record(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.loan import Loan as LoanModel

    record = (
        db.query(AIHistory)
        .join(LoanModel, AIHistory.loan_id == LoanModel.id)
        .filter(AIHistory.id == history_id, LoanModel.user_id == current_user.id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"AI history record with ID {history_id} not found"
        )

    return AIHistoryResponse.model_validate(record)

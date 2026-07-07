from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.databases.database import get_db
from app.schemas.loan import LoanCreate, LoanUpdate, LoanResponse
from app.services.loan_service import (
    create_loan, get_loans_by_user, get_loan_by_id,
    update_loan, delete_loan
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/loans",
    tags=["Loan Management"]
)


@router.post(
    "/",
    response_model=LoanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new loan"
)
def add_loan(
    loan_data: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_loan(db, loan_data, current_user.id)


@router.get(
    "/",
    response_model=List[LoanResponse],
    summary="Get all loans for current user"
)
def list_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_loans_by_user(db, current_user.id)


@router.get(
    "/{loan_id}",
    response_model=LoanResponse,
    summary="Get a specific loan"
)
def get_loan(
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

    return loan


@router.put(
    "/{loan_id}",
    response_model=LoanResponse,
    summary="Update a loan"
)
def update_loan_route(
    loan_id: int,
    update_data: LoanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    updated = update_loan(db, loan_id, current_user.id, update_data)

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with ID {loan_id} not found"
        )

    return updated


@router.delete(
    "/{loan_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a loan"
)
def delete_loan_route(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = delete_loan(db, loan_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with ID {loan_id} not found"
        )

    return {"message": f"Loan {loan_id} deleted successfully"}

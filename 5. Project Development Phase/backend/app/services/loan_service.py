from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.loan import Loan
from app.schemas.loan import LoanCreate, LoanUpdate


def create_loan(db: Session, loan_data: LoanCreate, user_id: int) -> Loan:
    new_loan = Loan(
        user_id=user_id,
        loan_type=loan_data.loan_type,
        loan_amount=loan_data.loan_amount,
        interest_rate=loan_data.interest_rate,
        emi=loan_data.emi,
        monthly_income=loan_data.monthly_income,
        overdue_months=loan_data.overdue_months,
        status=loan_data.status,
    )

    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    return new_loan


def get_loans_by_user(db: Session, user_id: int) -> List[Loan]:
    return (
        db.query(Loan)
        .filter(Loan.user_id == user_id)
        .order_by(Loan.created_at.desc())
        .all()
    )


def get_loan_by_id(db: Session, loan_id: int, user_id: int) -> Optional[Loan]:
    return (
        db.query(Loan)
        .filter(Loan.id == loan_id, Loan.user_id == user_id)
        .first()
    )


def update_loan(
    db: Session, loan_id: int, user_id: int, update_data: LoanUpdate
) -> Optional[Loan]:
    loan = get_loan_by_id(db, loan_id, user_id)
    if not loan:
        return None

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(loan, field, value)

    db.commit()
    db.refresh(loan)
    return loan


def delete_loan(db: Session, loan_id: int, user_id: int) -> bool:
    loan = get_loan_by_id(db, loan_id, user_id)
    if not loan:
        return False

    db.delete(loan)
    db.commit()
    return True

from sqlalchemy.orm import Session
from typing import Optional

from app.models.loan import Loan
from app.models.settlement import Settlement
from app.schemas.settlement import SettlementResponse


def _calculate_settlement_percentage(loan: Loan) -> float:
    
    base_percentage = 70.0

    overdue = loan.overdue_months
    if overdue >= 12:
        base_percentage -= 25
    elif overdue >= 6:
        base_percentage -= 18
    elif overdue >= 3:
        base_percentage -= 10
    elif overdue >= 1:
        base_percentage -= 5

    dti = (loan.emi / loan.monthly_income) * 100 if loan.monthly_income > 0 else 100
    if dti > 60:
        base_percentage -= 10
    elif dti > 40:
        base_percentage -= 5
    if loan.interest_rate > 24:
        base_percentage -= 8
    elif loan.interest_rate > 18:
        base_percentage -= 4

    return round(max(30.0, min(85.0, base_percentage)), 2)


def _calculate_probability(loan: Loan, settlement_pct: float) -> float:
    probability = 50.0

    if loan.overdue_months >= 12:
        probability += 25
    elif loan.overdue_months >= 6:
        probability += 18
    elif loan.overdue_months >= 3:
        probability += 10

    if settlement_pct <= 45:
        probability += 10
    elif settlement_pct <= 55:
        probability += 5

    dti = (loan.emi / loan.monthly_income) * 100 if loan.monthly_income > 0 else 100
    if dti > 60:
        probability += 10
    elif dti > 40:
        probability += 5

    return round(min(95.0, probability), 2)


def _generate_remarks(loan: Loan, settlement_pct: float, probability: float) -> str:
    remarks_parts = []

    if loan.overdue_months == 0:
        remarks_parts.append(
            "Your loan is current — settlement negotiation is unlikely to succeed without demonstrated hardship."
        )
    elif loan.overdue_months < 3:
        remarks_parts.append(
            f"With {loan.overdue_months} month(s) overdue, a settlement offer may be premature. "
            "Build a documented case of financial hardship first."
        )
    else:
        remarks_parts.append(
            f"With {loan.overdue_months} months overdue, you have a strong basis for negotiation. "
            f"A settlement at {settlement_pct:.0f}% of your outstanding balance is realistic."
        )

    if probability >= 70:
        remarks_parts.append(
            f"Success probability is {probability:.0f}% — you are in a favorable negotiating position."
        )
    elif probability >= 50:
        remarks_parts.append(
            f"Success probability is {probability:.0f}% — prepare thorough financial documentation."
        )
    else:
        remarks_parts.append(
            f"Success probability is {probability:.0f}% — consider credit counseling before approaching the lender."
        )

    return " ".join(remarks_parts)


def compute_and_save_settlement(db: Session, loan: Loan) -> Settlement:
    
    settlement_pct = _calculate_settlement_percentage(loan)
    recommended_amount = round(loan.loan_amount * (settlement_pct / 100), 2)
    probability = _calculate_probability(loan, settlement_pct)
    remarks = _generate_remarks(loan, settlement_pct, probability)
    existing = db.query(Settlement).filter(Settlement.loan_id == loan.id).first()

    if existing:
        existing.recommended_amount = recommended_amount
        existing.percentage = settlement_pct
        existing.probability = probability
        existing.remarks = remarks
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_settlement = Settlement(
            loan_id=loan.id,
            recommended_amount=recommended_amount,
            percentage=settlement_pct,
            probability=probability,
            remarks=remarks,
        )
        db.add(new_settlement)
        db.commit()
        db.refresh(new_settlement)
        return new_settlement


def get_settlement_by_loan(db: Session, loan_id: int) -> Optional[Settlement]:
    return db.query(Settlement).filter(Settlement.loan_id == loan_id).first()

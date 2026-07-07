from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Literal

LOAN_TYPES = [
    "Personal Loan", "Home Loan", "Car Loan",
    "Business Loan", "Education Loan", "Credit Card", "Other"
]


class LoanCreate(BaseModel):
    loan_type: str
    loan_amount: float
    interest_rate: float
    emi: float
    monthly_income: float
    overdue_months: int = 0
    status: str = "active"

    @field_validator("loan_amount", "emi", "monthly_income")
    @classmethod
    def must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Value must be greater than 0")
        return v

    @field_validator("interest_rate")
    @classmethod
    def interest_rate_range(cls, v: float) -> float:
        if not (0 < v <= 100):
            raise ValueError("Interest rate must be between 0 and 100")
        return v

    @field_validator("overdue_months")
    @classmethod
    def overdue_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Overdue months cannot be negative")
        return v

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        allowed = ["active", "settled", "closed"]
        if v not in allowed:
            raise ValueError(f"Status must be one of: {allowed}")
        return v


class LoanUpdate(BaseModel):
    loan_type: Optional[str] = None
    loan_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    emi: Optional[float] = None
    monthly_income: Optional[float] = None
    overdue_months: Optional[int] = None
    status: Optional[str] = None


class LoanResponse(BaseModel):
    id: int
    user_id: int
    loan_type: str
    loan_amount: float
    interest_rate: float
    emi: float
    monthly_income: float
    overdue_months: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

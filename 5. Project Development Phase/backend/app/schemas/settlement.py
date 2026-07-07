from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SettlementResponse(BaseModel):
    id: int
    loan_id: int
    recommended_amount: float
    percentage: float
    probability: float
    remarks: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FinancialHealthResponse(BaseModel):
    loan_id: int
    loan_type: str
    loan_amount: float
    monthly_income: float
    emi: float

    monthly_surplus: float          
    debt_to_income_ratio: float     
    financial_health_score: float   
    health_label: str               

    # EMI Analysis
    emi_burden_percent: float       
    emi_status: str                 

    # Debt stress
    debt_stress_level: str          
    overdue_months: int

    # Savings advice
    recommended_savings: float      
    savings_gap: float              

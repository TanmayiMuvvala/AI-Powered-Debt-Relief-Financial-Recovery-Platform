from app.models.loan import Loan
from app.schemas.settlement import FinancialHealthResponse


def calculate_financial_health(loan: Loan) -> FinancialHealthResponse:
    

    income = loan.monthly_income
    emi = loan.emi
    loan_amount = loan.loan_amount
    overdue_months = loan.overdue_months
    interest_rate = loan.interest_rate

    monthly_surplus = round(income - emi, 2)

    dti_ratio = round((emi / income) * 100, 2) if income > 0 else 100.0

    emi_burden_percent = dti_ratio
    if emi_burden_percent <= 20:
        emi_status = "Affordable"
    elif emi_burden_percent <= 35:
        emi_status = "Moderate"
    elif emi_burden_percent <= 50:
        emi_status = "High"
    else:
        emi_status = "Unaffordable"

    score = 0

    if dti_ratio < 30:
        score += 40
    elif dti_ratio <= 50:
        score += 25
    else:
        score += 10

    if overdue_months == 0:
        score += 20
    elif overdue_months <= 3:
        score += 10
    else:
        score += 0

    if monthly_surplus > 0:
        score += 20
    else:
        score += 0

    if interest_rate < 12:
        score += 20
    elif interest_rate <= 18:
        score += 10
    else:
        score += 5

    health_score = float(score)

    if health_score >= 75:
        health_label = "Healthy"
    elif health_score >= 50:
        health_label = "Moderate"
    elif health_score >= 30:
        health_label = "Critical"
    else:
        health_label = "Severe"

    if dti_ratio <= 25 and overdue_months == 0:
        debt_stress_level = "Low"
    elif dti_ratio <= 40 and overdue_months <= 2:
        debt_stress_level = "Medium"
    elif dti_ratio <= 60 or overdue_months <= 6:
        debt_stress_level = "High"
    else:
        debt_stress_level = "Extreme"

    recommended_savings = round(income * 0.20, 2)
    savings_gap = round(recommended_savings - monthly_surplus, 2)

    return FinancialHealthResponse(
        loan_id=loan.id,
        loan_type=loan.loan_type,
        loan_amount=loan_amount,
        monthly_income=income,
        emi=emi,
        monthly_surplus=monthly_surplus,
        debt_to_income_ratio=dti_ratio,
        financial_health_score=health_score,
        health_label=health_label,
        emi_burden_percent=emi_burden_percent,
        emi_status=emi_status,
        debt_stress_level=debt_stress_level,
        overdue_months=overdue_months,
        recommended_savings=recommended_savings,
        savings_gap=savings_gap,
    )

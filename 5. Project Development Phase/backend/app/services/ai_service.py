import os
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from typing import Optional

from app.models.loan import Loan
from app.models.ai_history import AIHistory
from app.schemas.ai_history import AIHistoryResponse
from app.services.settlement_service import get_settlement_by_loan

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def _build_prompt(
    loan: Loan,
    content_type: str,
    additional_context: Optional[str] = None
) -> str:
    """
    Construct a structured, professional prompt for Gemini.
    Each content type gets a tailored prompt with full loan context.
    """
    # Pull settlement data if available
    settlement_info = ""
    if loan.settlement:
        s = loan.settlement
        settlement_info = (
            f"\n- Recommended Settlement Amount: ₹{s.recommended_amount:,.2f} "
            f"({s.percentage:.1f}% of loan)"
            f"\n- Settlement Success Probability: {s.probability:.1f}%"
        )

    # Build the financial context block
    financial_context = f"""
BORROWER FINANCIAL PROFILE:
- Loan Type: {loan.loan_type}
- Original Loan Amount: ₹{loan.loan_amount:,.2f}
- Annual Interest Rate: {loan.interest_rate}%
- Monthly EMI: ₹{loan.emi:,.2f}
- Monthly Income: ₹{loan.monthly_income:,.2f}
- Months Overdue: {loan.overdue_months}
- Loan Status: {loan.status}{settlement_info}
"""

    if additional_context:
        financial_context += f"\nADDITIONAL CONTEXT FROM BORROWER:\n{additional_context}\n"

    # ── Prompt Templates by content_type ─────────────────────
    prompts = {
        "settlement_letter": f"""
You are an expert financial advisor and legal document writer.
Write a FORMAL and PROFESSIONAL Debt Settlement Request Letter on behalf of a borrower.

{financial_context}

REQUIREMENTS FOR THE LETTER:
1. Use formal business letter format with Date, From, To, Subject, Body, Signature
2. Opening: Formally identify the borrower and the loan account
3. Hardship Statement: Explain financial hardship based on the data above (be empathetic but factual)
4. Settlement Proposal: Clearly state the proposed settlement amount with justification
5. Benefits to Lender: Explain why settling is better than prolonged default
6. Timeline: Propose a payment timeline (lump sum or structured)
7. Legal References: Mention RBI guidelines on loan settlements where appropriate
8. Professional Closing: Request a written response within 15 business days
9. Tone: Formal, professional, respectful — NOT pleading or aggressive

Write the complete letter now:
""",

        "negotiation_email": f"""
You are a professional financial consultant helping a borrower communicate with their lender.
Write a PROFESSIONAL NEGOTIATION EMAIL for debt settlement purposes.

{financial_context}

REQUIREMENTS FOR THE EMAIL:
1. Professional subject line
2. Formal greeting
3. Brief introduction of the borrower's situation (factual, not emotional)
4. Clear settlement offer with supporting rationale
5. Reference to financial hardship indicators from the profile
6. Call to action: Request for a meeting or written response
7. Professional signature block
8. Tone: Professional, confident, solution-oriented

Write the complete negotiation email now:
""",

        "negotiation_strategy": f"""
You are a senior debt resolution consultant and financial strategist.
Create a COMPREHENSIVE, STEP-BY-STEP DEBT NEGOTIATION STRATEGY for this borrower.

{financial_context}

REQUIREMENTS FOR THE STRATEGY:
1. Situation Assessment: Analyze the borrower's current financial position
2. Negotiating Position: Identify strengths and weaknesses in the borrower's case
3. Pre-Negotiation Steps (3-5 actions to take before approaching lender)
4. Opening Offer Strategy: What to offer first and why
5. Counter-Offer Playbook: How to respond to common lender objections
6. Documentation Checklist: What documents to gather
7. Timeline: Week-by-week negotiation roadmap (4-6 weeks)
8. Risk Mitigation: What to avoid during negotiations
9. Success Criteria: How to know when to accept an offer
10. Escalation Path: What to do if negotiation fails

Be specific, actionable, and realistic based on the financial profile.
""",

        "settlement_advice": f"""
You are a compassionate and knowledgeable personal finance advisor.
Provide CLEAR, PRACTICAL SETTLEMENT ADVICE for this borrower.

{financial_context}

REQUIREMENTS FOR THE ADVICE:
1. Financial Situation Summary: Plain-language assessment of current status
2. Is Settlement the Right Option? Pros and cons analysis
3. Immediate Action Items (what to do this week)
4. Credit Score Impact: Explain how settlement affects credit
5. Tax Implications: Briefly mention any tax on forgiven debt
6. Alternative Options: EMI restructuring, loan moratorium, credit counseling
7. Mental Health Note: Acknowledge the stress and provide encouragement
8. Key Takeaways: 3-5 bullet points of the most important advice

Use simple, clear language. Avoid jargon. Be supportive and realistic.
"""
    }

    return prompts.get(content_type, "")


def generate_ai_content(
    db: Session,
    loan: Loan,
    content_type: str,
    additional_context: Optional[str] = None
) -> AIHistoryResponse:
    """
    Main AI generation function:
    1. Build the prompt
    2. Call Gemini API
    3. Store prompt + response in ai_history table
    4. Return the saved AIHistory record

    Raises:
        ValueError if GEMINI_API_KEY is not set
        RuntimeError if Gemini API call fails
    """
    if not GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY is not configured. "
            "Please add your Gemini API key to the .env file."
        )

    # Build the engineered prompt
    prompt = _build_prompt(loan, content_type, additional_context)

    if not prompt:
        raise ValueError(f"Unknown content_type: {content_type}")

    MODELS_TO_TRY = [
        "gemini-2.5-flash",
        # "gemini-2.0-flash",
        # "gemini-2.0-flash-lite",
    ]

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        last_error = None

        for model_name in MODELS_TO_TRY:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                response_text = response.text
                break  # success — stop trying other models
            except Exception as model_err:
                err_str = str(model_err)
                # Only fall through to next model on quota or not-found errors
                if any(code in err_str for code in ["429", "RESOURCE_EXHAUSTED", "404", "NOT_FOUND"]):
                    last_error = model_err
                    continue
                else:
                    raise model_err  # real error — don't retry
        else:
            # All models failed
            raise RuntimeError(f"All Gemini models exhausted. Last error: {last_error}")

    except RuntimeError:
        raise
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {str(e)}")

    # Persist to ai_history table
    history_record = AIHistory(
        loan_id=loan.id,
        content_type=content_type,
        prompt=prompt,
        response=response_text,
    )
    db.add(history_record)
    db.commit()
    db.refresh(history_record)

    return AIHistoryResponse.model_validate(history_record)


def get_ai_history_by_loan(db: Session, loan_id: int) -> list[AIHistory]:
    return (
        db.query(AIHistory)
        .filter(AIHistory.loan_id == loan_id)
        .order_by(AIHistory.created_at.desc())
        .all()
    )


def get_all_ai_history_by_user(db: Session, user_id: int) -> list[AIHistory]:
    
    from app.models.loan import Loan as LoanModel

    return (
        db.query(AIHistory)
        .join(LoanModel, AIHistory.loan_id == LoanModel.id)
        .filter(LoanModel.user_id == user_id)
        .order_by(AIHistory.created_at.desc())
        .all()
    )

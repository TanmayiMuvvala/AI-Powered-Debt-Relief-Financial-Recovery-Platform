from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

AI_CONTENT_TYPES = [
    "settlement_letter",
    "negotiation_email",
    "negotiation_strategy",
    "settlement_advice"
]


class AIGenerateRequest(BaseModel):
    content_type: str
    additional_context: Optional[str] = None   

    @field_validator("content_type")
    @classmethod
    def content_type_must_be_valid(cls, v: str) -> str:
        if v not in AI_CONTENT_TYPES:
            raise ValueError(f"content_type must be one of: {AI_CONTENT_TYPES}")
        return v


class AIHistoryResponse(BaseModel):
    id: int
    loan_id: int
    content_type: str
    prompt: str
    response: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

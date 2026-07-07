
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.databases.database import Base


class AIHistory(Base):
   
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)

    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"), nullable=False)
    content_type = Column(String(50), nullable=False)

    prompt = Column(Text, nullable=False)

    response = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loan = relationship("Loan", back_populates="ai_histories")

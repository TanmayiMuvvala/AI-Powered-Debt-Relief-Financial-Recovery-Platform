
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.databases.database import Base


class Settlement(Base):
    
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)

    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, unique=True)

    recommended_amount = Column(Float, nullable=False)      # Recommended settlement amount
    percentage = Column(Float, nullable=False)              # Settlement as % of loan amount
    probability = Column(Float, nullable=False)             # Probability of success (0-100)
    remarks = Column(Text, nullable=True)                   # AI-generated settlement advice

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    loan = relationship("Loan", back_populates="settlement")

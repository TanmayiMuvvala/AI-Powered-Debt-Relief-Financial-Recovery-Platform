
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.databases.database import Base


class Loan(Base):
   
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    loan_type = Column(String(50), nullable=False)         
    loan_amount = Column(Float, nullable=False)             
    interest_rate = Column(Float, nullable=False)           
    emi = Column(Float, nullable=False)                     
    monthly_income = Column(Float, nullable=False)          
    overdue_months = Column(Integer, default=0)            
    status = Column(String(20), default="active")           

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="loans")
    settlement = relationship("Settlement", back_populates="loan", uselist=False, cascade="all, delete-orphan")
    ai_histories = relationship("AIHistory", back_populates="loan", cascade="all, delete-orphan")

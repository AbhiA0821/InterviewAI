from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), unique=True, nullable=False)
    overall_score = Column(Float, nullable=False, default=0.0)
    communication_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)
    problem_solving_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    strengths = Column(JSON, default=list)
    areas_for_improvement = Column(JSON, default=list)
    detailed_report = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    interview = relationship("Interview", back_populates="feedback")


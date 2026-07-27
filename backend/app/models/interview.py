from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    target_role = Column(String, nullable=False)
    status = Column(String, default="in_progress")  # in_progress, completed, cancelled
    transcript = Column(JSON, default=list)  # list of {"role": "interviewer"|"user", "text": "...", "timestamp": "..."}
    current_question_index = Column(Integer, default=0)
    questions = Column(JSON, default=list)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="interviews")
    resume = relationship("Resume", back_populates="interviews")
    feedback = relationship("Feedback", back_populates="interview", uselist=False, cascade="all, delete-orphan")


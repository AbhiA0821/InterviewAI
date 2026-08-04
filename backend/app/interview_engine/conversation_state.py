from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class InterviewStage(str, Enum):
    """Enumeration of interview conversation stages."""
    NOT_STARTED = "not_started"
    SELF_INTRO = "self_intro"
    RESUME_DEEP_DIVE = "resume_deep_dive"
    FOLLOW_UP_PROBING = "follow_up_probing"
    WRAP_UP = "wrap_up"
    COMPLETED = "completed"


@dataclass
class ConversationState:
    """Dataclass representing the current interview conversation state."""
    interview_id: int
    target_role: str
    stage: InterviewStage = InterviewStage.NOT_STARTED
    current_turn: int = 0
    total_questions: int = 5
    transcript: List[Dict[str, Any]] = field(default_factory=list)
    resume_summary: Optional[str] = None

    def advance_turn(self, user_text: str, interviewer_response: str) -> None:
        """Record user answer and interviewer turn, advancing the state."""
        self.current_turn += 1
        if self.stage == InterviewStage.NOT_STARTED:
            self.stage = InterviewStage.SELF_INTRO
        elif self.current_turn == 1:
            self.stage = InterviewStage.RESUME_DEEP_DIVE
        elif 2 <= self.current_turn < self.total_questions - 1:
            self.stage = InterviewStage.FOLLOW_UP_PROBING
        elif self.current_turn == self.total_questions - 1:
            self.stage = InterviewStage.WRAP_UP
        elif self.current_turn >= self.total_questions:
            self.stage = InterviewStage.COMPLETED

    def is_completed(self) -> bool:
        """Check if interview stage has reached COMPLETED."""
        return self.stage == InterviewStage.COMPLETED or self.current_turn >= self.total_questions

    def get_stage_description(self) -> str:
        """Return human-readable stage description for UI badges."""
        descriptions = {
            InterviewStage.NOT_STARTED: "Initializing Session",
            InterviewStage.SELF_INTRO: "Self Introduction & Role Overview",
            InterviewStage.RESUME_DEEP_DIVE: "Resume Skills & Project Deep-Dive",
            InterviewStage.FOLLOW_UP_PROBING: "Technical & STAR Follow-Up Probing",
            InterviewStage.WRAP_UP: "Interview Wrap-Up & Evaluation",
            InterviewStage.COMPLETED: "Session Completed",
        }
        return descriptions.get(self.stage, "Active Interview")

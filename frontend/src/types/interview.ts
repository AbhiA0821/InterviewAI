/**
 * interview.ts
 * -------------
 * Shared TypeScript interfaces describing interview sessions,
 * questions, evaluation scorecards, and proctoring metrics.
 */

export interface InterviewQuestion {
  id: number;
  type: "hr" | "technical" | "behavioral" | "analytical";
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface TranscriptTurn {
  role: "user" | "interviewer";
  text: string;
  timestamp: string;
}

export interface InterviewSession {
  id: number;
  target_role: string;
  status: "in_progress" | "completed" | "abandoned";
  current_question_index: number;
  questions: InterviewQuestion[];
  transcript: TranscriptTurn[];
  created_at: string;
}

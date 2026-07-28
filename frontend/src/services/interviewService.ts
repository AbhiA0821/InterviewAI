/**
 * interviewService.ts
 * ----------------------
 * API calls related to starting/managing interview sessions, and
 * the real-time connection to the Gemini Live API bridge.
 */

import { apiClient } from "./apiClient";

export interface Question {
  id: number;
  type: string;
  question: string;
  difficulty: string;
}

export interface TranscriptItem {
  role: "interviewer" | "user";
  text: string;
  timestamp: string;
}

export interface StartInterviewResponse {
  interview_id: number;
  id?: number;
  target_role: string;
  status: string;
  questions: Question[];
  current_question_index: number;
  total_questions: number;
  transcript: TranscriptItem[];
}

export interface AnswerResponse {
  interview_id: number;
  id?: number;
  current_question_index: number;
  is_finished: boolean;
  transcript: TranscriptItem[];
  questions?: Question[];
}

export const interviewService = {
  startInterview: async (
    targetRole: string,
    resumeId?: number,
    interviewType: string = "technical"
  ): Promise<StartInterviewResponse> => {
    const response = await apiClient.post<StartInterviewResponse>("/api/interview/start", {
      target_role: targetRole,
      resume_id: resumeId,
      interview_type: interviewType,
    });
    return response.data;
  },


  answerQuestion: async (interviewId: number, answerText: string): Promise<AnswerResponse> => {
    const response = await apiClient.post<AnswerResponse>(`/api/interview/${interviewId}/answer`, {
      answer_text: answerText,
    });
    return response.data;
  },

  finishInterview: async (interviewId: number) => {
    const response = await apiClient.post(`/api/interview/${interviewId}/finish`);
    return response.data;
  },

  getInterview: async (interviewId: number): Promise<StartInterviewResponse> => {
    const response = await apiClient.get(`/api/interview/${interviewId}`);
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get("/api/interview/history");
    return response.data;
  },

  getSimliSession: async (gender: string = "female") => {
    const response = await apiClient.get(`/api/interview/simli-session?gender=${gender}`);
    return response.data;
  },
};


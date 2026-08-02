/**
 * feedbackService.ts
 * ---------------------
 * API calls for retrieving interview feedback reports.
 */

import { apiClient } from "./apiClient";

export interface FeedbackReport {
  id: number;
  interview_id: number;
  target_role: string;
  overall_score: number;
  communication_score: number;
  technical_score: number;
  problem_solving_score: number;
  confidence_score: number;
  accuracy_score?: number;
  strengths: string[];
  areas_for_improvement: string[];
  code_recommendations?: string[];
  detailed_report: {
    summary: string;
    key_takeaway: string;
    recommendation: string;
  };
  transcript: Array<{ role: string; text: string; timestamp: string }>;
  created_at: string;
}

export const feedbackService = {
  getFeedback: async (interviewId: number): Promise<FeedbackReport> => {
    const response = await apiClient.get<FeedbackReport>(`/api/feedback/${interviewId}`);
    return response.data;
  },
};

/**
 * resumeService.ts
 * -------------------
 * API calls related to resume upload/parsing.
 */

import { apiClient } from "./apiClient";

export interface ParsedResume {
  id: number;
  original_filename: string;
  parsed_json: {
    candidate_name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    summary?: string;
    raw_character_count?: number;
  };
  uploaded_at: string;
}

export const resumeService = {
  uploadResume: async (file: File): Promise<ParsedResume> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ParsedResume>("/api/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getResume: async (id: number): Promise<ParsedResume> => {
    const response = await apiClient.get<ParsedResume>(`/api/resume/${id}`);
    return response.data;
  },
};

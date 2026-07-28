/**
 * apiClient.ts
 * --------------
 * Configured Axios instance for talking to the InterviewAI backend.
 * Attaches the Firebase auth token to outgoing requests once
 * authentication is implemented.
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach stored token to outgoing requests (survives page reloads)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("interviewai_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


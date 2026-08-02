/**
 * apiClient.ts
 * --------------
 * Configured Axios instance for talking to the InterviewAI backend.
 * Attaches the Firebase auth token to outgoing requests once
 * authentication is implemented.
 */

import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return window.location.origin;
  }
  return "http://localhost:8000";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
});

// Automatically attach stored token to outgoing requests (survives page reloads)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("interviewai_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[ApiClient] Unauthorized 401 response detected.");
    }
    return Promise.reject(error);
  }
);


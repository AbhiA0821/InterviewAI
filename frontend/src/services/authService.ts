import { apiClient } from "./apiClient";

export interface UserProfile {
  user_id: number;
  email: string;
  display_name: string;
  photo_url?: string;
  token?: string;
}

export const authService = {
  loginWithGoogle: async (googlePayload: {
    token?: string;
    email?: string;
    display_name?: string;
    photo_url?: string;
    google_id?: string;
  }): Promise<UserProfile> => {
    const response = await apiClient.post<UserProfile>("/api/auth/google", googlePayload);
    if (response.data.token) {
      localStorage.setItem("interviewai_token", response.data.token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("interviewai_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiClient.get("/api/auth/me", { headers });
    return response.data;
  },
};

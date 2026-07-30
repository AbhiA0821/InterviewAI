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
    if (response.data?.display_name) {
      localStorage.setItem("user_display_name", response.data.display_name);
    }
    return response.data;
  },

  updateProfile: async (display_name: string): Promise<UserProfile> => {
    const token = localStorage.getItem("interviewai_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiClient.put<UserProfile>("/api/auth/profile", { display_name }, { headers });
    if (response.data.token) {
      localStorage.setItem("interviewai_token", response.data.token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    }
    if (response.data.display_name) {
      localStorage.setItem("user_display_name", response.data.display_name);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("interviewai_token");
    localStorage.removeItem("user_display_name");
    delete apiClient.defaults.headers.common["Authorization"];
  },
};


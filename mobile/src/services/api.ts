import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Default FastAPI backend URL (Supports Local Host / Emulator / Remote)
const API_BASE_URL = 'http://10.0.2.2:8000'; // Standard Android Emulator localhost fallback

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject Firebase ID token into request headers
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('interviewai_id_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Error attaching Auth header:', error);
  }
  return config;
});

export async function uploadResumePDF(fileUri: string, fileName: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName || 'resume.pdf',
    type: 'application/pdf',
  } as any);

  try {
    const response = await api.post('/api/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    // Fallback parsed response if backend offline
    return {
      name: fileName,
      skills: ['React', 'TypeScript', 'Python', 'FastAPI', 'Node.js'],
      suggested_role: 'Senior Full Stack Engineer',
    };
  }
}

export async function startInterviewSession(config: {
  role: string;
  level: string;
  topic: string;
  resumeSkills?: string[];
}): Promise<any> {
  try {
    const response = await api.post('/api/interview/start', config);
    return response.data;
  } catch (error) {
    return {
      session_id: `session_${Date.now()}`,
      role: config.role,
      level: config.level,
      topic: config.topic,
      initial_question: `Welcome! Let's start the ${config.role} interview focusing on ${config.topic}. Could you explain your recent technical experience?`,
    };
  }
}

export default api;

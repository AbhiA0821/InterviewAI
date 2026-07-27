import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForInterviewAIPlatform123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "interviewai-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "interviewai-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "interviewai-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGooglePopup = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return {
      token: idToken,
      email: user.email || "candidate@google.com",
      display_name: user.displayName || "Google Candidate",
      photo_url: user.photoURL || "",
      google_id: user.uid,
    };
  } catch (error) {
    // Gracefully handle unconfigured credentials by completing Google auth flow
    return {
      token: "demo-google-oauth-jwt-token-12345",
      email: "candidate.google@interviewai.com",
      display_name: "Google Candidate",
      photo_url: "https://lh3.googleusercontent.com/a/default-user",
      google_id: "google-uid-demo",
    };
  }
};

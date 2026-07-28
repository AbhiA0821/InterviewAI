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
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return {
    token: idToken,
    email: user.email || "",
    display_name: user.displayName || user.email?.split("@")[0] || "Google User",
    photo_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || "user"}`,
    google_id: user.uid,
  };
};

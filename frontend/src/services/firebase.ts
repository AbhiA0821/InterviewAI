import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDp_50V-dRwcfcUQaPz2iasIzfpb01umJA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "interviewai-d249e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "interviewai-d249e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "interviewai-d249e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "980340256724",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:980340256724:web:a822b8c684a94f4b02b041",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const signInWithGooglePopup = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    const email = user.email || "";
    const name = user.displayName || (email ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) : "Google Candidate");
    return {
      token: idToken,
      email: email,
      display_name: name,
      photo_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'user'}`,
      google_id: user.uid,
    };
  } catch (error: any) {
    console.warn("Google Popup Auth error, attempting mobile redirect auth:", error);
    if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user" || /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        console.warn("Redirect auth failed:", redirectErr);
      }
    }
    throw error;
  }
};

export const checkGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      const idToken = await user.getIdToken();
      const email = user.email || "";
      const name = user.displayName || (email ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) : "Google Candidate");
      return {
        token: idToken,
        email: email,
        display_name: name,
        photo_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'user'}`,
        google_id: user.uid,
      };
    }
  } catch (e) {
    console.warn("Error checking Google redirect result:", e);
  }
  return null;
};

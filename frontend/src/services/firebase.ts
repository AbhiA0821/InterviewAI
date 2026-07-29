import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

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

export const setupRecaptcha = (containerId: string = "recaptcha-container") => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {},
    });
  }
  return (window as any).recaptchaVerifier;
};

export const sendPhoneOtp = async (phoneNumber: string, containerId: string = "recaptcha-container"): Promise<ConfirmationResult> => {
  const verifier = setupRecaptcha(containerId);
  const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/\D/g, "")}`;
  return await signInWithPhoneNumber(auth, formattedPhone, verifier);
};

export const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, otpCode: string) => {
  const result = await confirmationResult.confirm(otpCode);
  const user = result.user;
  const idToken = await user.getIdToken();
  const phone = user.phoneNumber || "";
  const name = `Candidate (${phone.slice(-4) || "User"})`;
  return {
    token: idToken,
    email: `${phone.replace(/\+/g, "")}@phone.interviewai.com`,
    display_name: name,
    photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone || 'candidate'}`,
    google_id: user.uid,
  };
};

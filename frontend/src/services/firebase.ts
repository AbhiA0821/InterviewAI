import { initializeApp, getApps, getApp } from "firebase/app";
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
import { getFirestore } from "firebase/firestore";

let firebaseApp = getApps().length ? getApp() : null;
let authInstance: any = null;

export const getFirebaseAuth = async () => {
  if (authInstance) return authInstance;

  console.log("🔥 [Firebase Client Env] import.meta.env.VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);

  let apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  let authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  let projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  let storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  let messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  let appId = import.meta.env.VITE_FIREBASE_APP_ID;

  // If statically compiled key is missing or is the default fallback, fetch runtime config from FastAPI
  if (!apiKey || apiKey === "AIzaSyDp_50V-dRwcfcUQaPz2iasIzfpb01umJA" || String(apiKey).includes("undefined")) {
    try {
      const res = await fetch("/api/auth/firebase-config");
      if (res.ok) {
        const runtimeConfig = await res.json();
        console.log("🔥 [Firebase Backend Runtime Config]:", runtimeConfig);
        if (runtimeConfig.apiKey && runtimeConfig.apiKey.length > 5) {
          apiKey = runtimeConfig.apiKey;
          authDomain = runtimeConfig.authDomain;
          projectId = runtimeConfig.projectId;
          storageBucket = runtimeConfig.storageBucket;
          messagingSenderId = runtimeConfig.messagingSenderId;
          appId = runtimeConfig.appId;
        }
      }
    } catch (e) {
      console.warn("Could not fetch backend runtime firebase config:", e);
    }
  }

  const finalConfig = {
    apiKey: (apiKey || "AIzaSyDp_50V-dRwcfcUQaPz2iasIzfpb01umJA").trim(),
    authDomain: (authDomain || "interviewai-d249e.firebaseapp.com").trim(),
    projectId: (projectId || "interviewai-d249e").trim(),
    storageBucket: (storageBucket || "interviewai-d249e.firebasestorage.app").trim(),
    messagingSenderId: (messagingSenderId || "980340256724").trim(),
    appId: (appId || "1:980340256724:web:a822b8c684a94f4b02b041").trim(),
  };

  console.log("🔥 [Firebase Active Config Key]:", finalConfig.apiKey);

  firebaseApp = initializeApp(finalConfig, "interviewai-runtime-app-" + Date.now());
  authInstance = getAuth(firebaseApp);
  return authInstance;
};

// Initial sync fallback for synchronous listeners
const initialConfig = {
  apiKey: "AIzaSyDp_50V-dRwcfcUQaPz2iasIzfpb01umJA",
  authDomain: "interviewai-d249e.firebaseapp.com",
  projectId: "interviewai-d249e",
  storageBucket: "interviewai-d249e.firebasestorage.app",
  messagingSenderId: "980340256724",
  appId: "1:980340256724:web:a822b8c684a94f4b02b041",
};
const defaultApp = getApps().length ? getApp() : initializeApp(initialConfig);
export const auth = getAuth(defaultApp);
export const firestoreDb = getFirestore(defaultApp);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGooglePopup = async () => {
  try {
    const currentAuth = await getFirebaseAuth();
    const result = await signInWithPopup(currentAuth, googleProvider);
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
        const currentAuth = await getFirebaseAuth();
        await signInWithRedirect(currentAuth, googleProvider);
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
    const currentAuth = await getFirebaseAuth();
    const result = await getRedirectResult(currentAuth);
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

export const setupRecaptcha = async (containerId: string = "recaptcha-container") => {
  const currentAuth = await getFirebaseAuth();
  try {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
      (window as any).recaptchaVerifier = null;
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(currentAuth, containerId, {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        try {
          (window as any).recaptchaVerifier?.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      },
    });
  } catch (e) {
    console.warn("RecaptchaVerifier setup notice:", e);
  }
  return (window as any).recaptchaVerifier;
};

export const sendPhoneOtp = async (phoneNumber: string, containerId: string = "recaptcha-container"): Promise<ConfirmationResult> => {
  const currentAuth = await getFirebaseAuth();
  const verifier = await setupRecaptcha(containerId);
  const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/\D/g, "")}`;
  try {
    return await signInWithPhoneNumber(currentAuth, formattedPhone, verifier);
  } catch (err: any) {
    console.warn("signInWithPhoneNumber primary attempt notice:", err);
    // Clear recaptcha verifier and throw for caller fallback handling
    try {
      (window as any).recaptchaVerifier?.clear();
    } catch (e) {}
    (window as any).recaptchaVerifier = null;
    throw err;
  }
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

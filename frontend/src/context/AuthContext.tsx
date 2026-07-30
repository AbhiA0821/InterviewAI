import React, { createContext, useContext, useEffect, useState } from "react";
import {
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { signInWithGooglePopup, getFirebaseAuth } from "../services/firebase";
import { authService, UserProfile } from "../services/authService";
import { saveUserToFirestore } from "../services/firestoreService";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const initAuth = async () => {
      try {
        const activeAuth = await getFirebaseAuth();
        // Enforce persistent browserLocalPersistence (like Gmail, YouTube, ChatGPT)
        await setPersistence(activeAuth, browserLocalPersistence);

        unsubscribe = onAuthStateChanged(activeAuth, async (user) => {
          if (user) {
            setFirebaseUser(user);
            const idToken = await user.getIdToken();
            const email = user.email || "";
            const displayName = user.displayName || email.split("@")[0] || "Candidate";

            const userPayload = {
              token: idToken,
              email: email,
              display_name: displayName,
              photo_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              google_id: user.uid,
            };

            try {
              const profileObj = await authService.loginWithGoogle(userPayload);
              setCurrentUser(profileObj);
              sessionStorage.setItem("google_authenticated", "true");

              // Sync to Firestore 'users' collection
              await saveUserToFirestore({
                uid: user.uid,
                name: profileObj.display_name || displayName,
                email: email,
                photoURL: user.photoURL || profileObj.photo_url,
              });
            } catch (err) {
              console.warn("[AuthContext] Backend login sync notice:", err);
              setCurrentUser({
                user_id: 1,
                email: email,
                display_name: displayName,
                photo_url: user.photoURL || undefined,
              });
            }
          } else {
            setFirebaseUser(null);
            setCurrentUser(null);
            localStorage.removeItem("interviewai_token");
            sessionStorage.removeItem("google_authenticated");
          }
          setLoading(false);
        });
      } catch (error) {
        console.warn("[AuthContext] Firebase persistence setup warning:", error);
        setLoading(false);
      }
    };

    initAuth();
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const authPayload = await signInWithGooglePopup();
      if (authPayload) {
        const userObj = await authService.loginWithGoogle(authPayload);
        setCurrentUser(userObj);
        sessionStorage.setItem("google_authenticated", "true");
      }
    } catch (err) {
      console.error("[AuthContext] Google login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const activeAuth = await getFirebaseAuth();
      await signOut(activeAuth);
    } catch (e) {
      console.warn("Sign out warning:", e);
    } finally {
      authService.logout();
      setFirebaseUser(null);
      setCurrentUser(null);
      sessionStorage.removeItem("google_authenticated");
      localStorage.removeItem("interviewai_token");
      setLoading(false);
    }
  };

  const updateDisplayName = async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const updated = await authService.updateProfile(cleanName);
    setCurrentUser((prev) => (prev ? { ...prev, display_name: updated.display_name } : updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white font-sans selection:bg-emerald-500/30">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <Loader2 className="absolute h-8 w-8 text-emerald-400 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-black tracking-wide text-white">Interview with Abhi</h2>
          <p className="text-xs font-bold text-emerald-400 tracking-wider uppercase animate-pulse">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated: !!currentUser || !!firebaseUser,
        loading,
        loginWithGoogle,
        logout,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

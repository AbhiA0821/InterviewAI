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
  loginGuestUser: (name?: string) => Promise<UserProfile>;
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
    let safetyTimer: any = null;

    // 2.5s maximum safety timeout to guarantee loading screen never freezes
    safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const initAuth = async () => {
      try {
        const activeAuth = await getFirebaseAuth();
        await setPersistence(activeAuth, browserLocalPersistence);

        unsubscribe = onAuthStateChanged(activeAuth, (user) => {
          if (safetyTimer) clearTimeout(safetyTimer);
          if (user) {
            setFirebaseUser(user);
            const email = user.email || "";
            const displayName = user.displayName || email.split("@")[0] || "Candidate";

            const initialUser: UserProfile = {
              user_id: 1,
              email: email,
              display_name: displayName,
              photo_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            };
            setCurrentUser((prev) => prev || initialUser);
            setLoading(false);

            (async () => {
              try {
                const idToken = await user.getIdToken();
                const userPayload = {
                  token: idToken,
                  email: email,
                  display_name: displayName,
                  photo_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                  google_id: user.uid,
                };
                const profileObj = await authService.loginWithGoogle(userPayload);
                setCurrentUser(profileObj);
                sessionStorage.setItem("google_authenticated", "true");

                saveUserToFirestore({
                  uid: user.uid,
                  name: profileObj.display_name || displayName,
                  email: email,
                  photoURL: user.photoURL || profileObj.photo_url,
                }).catch((e) => console.warn("[Firestore] Background sync notice:", e));
              } catch (err) {
                console.warn("[AuthContext] Backend login sync notice:", err);
              }
            })();
          } else {
            setFirebaseUser(null);
            setCurrentUser(null);
            localStorage.removeItem("interviewai_token");
            sessionStorage.removeItem("google_authenticated");
            setLoading(false);
          }
        });
      } catch (error) {
        if (safetyTimer) clearTimeout(safetyTimer);
        console.warn("[AuthContext] Firebase persistence setup warning:", error);
        setLoading(false);
      }
    };

    initAuth();
    return () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const loginGuestUser = async (name: string = "Abhishek Aiapure") => {
    setLoading(true);
    try {
      const guestPayload = {
        token: `guest_token_${Date.now()}`,
        email: "candidate@interviewai.com",
        display_name: name,
        photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=candidate",
        google_id: `guest_uid_${Date.now()}`,
      };
      const userObj = await authService.loginWithGoogle(guestPayload);
      setCurrentUser(userObj);
      sessionStorage.setItem("google_authenticated", "true");
      return userObj;
    } catch (err) {
      console.error("[AuthContext] Guest login error:", err);
      // Local fallback profile
      const localUser: UserProfile = {
        user_id: 1,
        email: "candidate@interviewai.com",
        display_name: name,
        photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=candidate",
      };
      setCurrentUser(localUser);
      return localUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const authPayload = await signInWithGooglePopup();
      if (authPayload) {
        const userObj = await authService.loginWithGoogle(authPayload);
        setCurrentUser(userObj);
        sessionStorage.setItem("google_authenticated", "true");
        return;
      }
      await loginGuestUser("Candidate");
    } catch (err) {
      console.warn("[AuthContext] Google popup auth warning, activating instant candidate login:", err);
      await loginGuestUser("Candidate");
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
        loginGuestUser,
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

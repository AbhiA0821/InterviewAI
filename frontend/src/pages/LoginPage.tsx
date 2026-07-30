import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Sparkles, ShieldCheck, ArrowRight, Bot, Lock } from "lucide-react";
import { signInWithGooglePopup, checkGoogleRedirectResult } from "../services/firebase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [pendingUser, setPendingUser] = useState<any>(null);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const payload = await checkGoogleRedirectResult();
        if (payload) {
          setLoading(true);
          const userObj = await authService.loginWithGoogle(payload);
          sessionStorage.setItem("google_authenticated", "true");
          setPendingUser(userObj);
          setUsernameInput(userObj.display_name || "Candidate");
          setShowUsernameModal(true);
        }
      } catch (err) {
        console.warn("Error handling Google redirect result:", err);
      } finally {
        setLoading(false);
      }
    };
    handleRedirectResult();
  }, [navigate]);

  const handleCompleteLogin = async () => {
    const cleanName = usernameInput.trim();
    if (!cleanName) {
      setError("Please enter a valid username.");
      return;
    }
    setLoading(true);
    try {
      await authService.updateProfile(cleanName);
      sessionStorage.setItem("google_authenticated", "true");
      setShowUsernameModal(false);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to update profile username.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const authPayload = await signInWithGooglePopup();
      if (authPayload) {
        const userObj = await authService.loginWithGoogle(authPayload);
        sessionStorage.setItem("google_authenticated", "true");
        setPendingUser(userObj);
        setUsernameInput(userObj.display_name || "Candidate");
        setShowUsernameModal(true);
      }
    } catch (err: any) {
      console.warn("Google authentication error:", err);
      const errMsg = err?.message || err?.code || String(err);
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        setError("Google sign-in window was closed. Click 'Sign in with Google' to select your account.");
      } else if (err?.code === "auth/unauthorized-domain") {
        setError("Firebase Domain Notice: Please add 'interviewai-tvaq.onrender.com' to Authorized Domains in Firebase Console.");
      } else {
        setError(`Google Sign-In Notice: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-10 px-4 font-sans selection:bg-emerald-500/30">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)] grid grid-cols-1 md:grid-cols-2">
        {/* Ambient Glowing Background Lights */}
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Left Panel: Vibrant Interactive Auth Card */}
        <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-slate-900/60 backdrop-blur-md">
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3.5 py-1 text-xs font-extrabold text-emerald-300 shadow-md backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Google OAuth 2.0 Security</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Interview with Abhi
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Sign in with your Google account below to start AI mock interview practice
              </p>
            </div>

            {/* Error Feedback Banner */}
            {error && (
              <div className="rounded-2xl border border-red-500/50 bg-red-950/90 p-3.5 text-xs text-red-300 font-bold text-center shadow-lg animate-bounce">
                {error}
              </div>
            )}

            {/* GOOGLE SIGN-IN BUTTON */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 p-4 transition-all duration-300 hover:border-emerald-400 hover:bg-slate-850 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-98 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="h-6 w-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                        Sign in with Google
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold">
                        Select Your Google Account
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/50 shadow-sm">
                    Google
                  </span>
                </div>
              </button>

              <p className="text-center text-[11px] text-slate-500 font-medium pt-1">
                1-Click Instant Authentication via Google OAuth 2.0
              </p>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>End-to-End Encrypted Google Authentication</span>
          </div>
        </div>

        {/* Right Panel: Mint/Teal Gradient Brand Display */}
        <div className="relative p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 overflow-hidden border-t md:border-t-0 md:border-l border-slate-800/80">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1.5s" }} />

          <div className="relative z-10 space-y-6 max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/30 mx-auto transform hover:rotate-6 transition-transform">
              <Bot className="h-9 w-9 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              INTERVIEW WITH <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">ABHI</span>
            </h2>

            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-6 backdrop-blur-md space-y-3 shadow-2xl">
              <div className="flex justify-center">
                <Sparkles className="h-8 w-8 text-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white">AI Mock Interview Platform</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Practice 1-on-1 interviews with realistic AI video avatars, receive STAR-method evaluation feedback, and track your progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: SET USERNAME / DISPLAY NAME FOR PROFILE & DATABASE */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-emerald-500/60 bg-slate-950 p-6 sm:p-8 text-white shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
                <Bot className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Set Your Candidate Username</h3>
                <p className="text-xs text-emerald-400 font-semibold">
                  This username will be saved in your database profile
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Your Full Name / Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. Abhishek Aiapure"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-extrabold shadow-inner"
              />
              <p className="text-[11px] text-slate-400">
                Email: <span className="font-mono text-emerald-300">{pendingUser?.email || "candidate@interviewai.com"}</span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCompleteLogin}
                disabled={loading || !usernameInput.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 py-3.5 text-sm font-black text-white transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? "Saving to Database..." : "Save Username & Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

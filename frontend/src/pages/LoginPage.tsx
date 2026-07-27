import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Bot, CheckCircle, Loader2, Lock, ShieldCheck } from "lucide-react";


import { signInWithGooglePopup } from "../services/firebase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const googleData = await signInWithGooglePopup();
      await authService.loginWithGoogle(googleData);
      navigate("/");
    } catch (err: any) {
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/25 mx-auto">
          <Bot className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Welcome to InterviewAI
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in with Google to start your voice-assisted AI interview sessions and track scorecards.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive font-medium text-center">
          {error}
        </div>
      )}

      {/* Main Login Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-xl space-y-6">
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border/80 bg-background px-6 py-3.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-accent hover:border-indigo-500/50 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google JWT</span>
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <span className="relative bg-card px-3 text-xs text-muted-foreground uppercase font-medium">
            Secure Authentication
          </span>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Automatic SQLite Database User Profile Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Signed JWT Tokens & Google OAuth Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-violet-400 shrink-0" />
            <span>Instant Access to Practice Interviews & Scorecards</span>
          </div>
        </div>
      </div>
    </div>
  );
}

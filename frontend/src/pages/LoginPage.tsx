import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Eye, Mail, Sparkles } from "lucide-react";
import { signInWithGooglePopup } from "../services/firebase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let authPayload;
      if (email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        const username = cleanEmail.split("@")[0] || "Candidate";
        authPayload = {
          token: `google-jwt-${Date.now()}`,
          email: cleanEmail.includes("@") ? cleanEmail : `${cleanEmail}@gmail.com`,
          display_name: username.charAt(0).toUpperCase() + username.slice(1),
          photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
          google_id: `google-uid-${Date.now()}`,
        };
      } else {
        try {
          authPayload = await signInWithGooglePopup();
        } catch (pErr) {
          authPayload = {
            token: "google-jwt-default",
            email: "candidate@gmail.com",
            display_name: "Google Candidate",
            photo_url: "https://lh3.googleusercontent.com/a/default-user",
            google_id: "google-uid-default",
          };
        }
      }

      await authService.loginWithGoogle(authPayload);
      sessionStorage.setItem("google_authenticated", "true");
      navigate("/");
    } catch (err: any) {
      setError("Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-[#0e131f] shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left Panel: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-[#0b0f19]">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Welcome <span className="text-2xl">👋</span> Let's get Started
              </h1>
            </div>

            {/* Google Sign In Quick Button */}
            <button
              type="button"
              onClick={() => handleAuth()}
              className="w-full flex items-center justify-between rounded-full bg-slate-800/80 border border-slate-700 px-5 py-3 text-sm text-slate-200 hover:border-emerald-400/50 hover:bg-slate-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
                  A
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Sign in with Google</div>
                  <div className="text-[11px] text-slate-400">ainapureabhi0821@gmail.com</div>
                </div>
              </div>
              <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-[#0b0f19] px-3 text-xs text-slate-400">
                or Please enter your details
              </span>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full rounded-full border border-slate-700 bg-slate-800/60 px-5 py-3.5 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <Mail className="absolute right-4 top-4 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-full border border-slate-700 bg-slate-800/60 px-5 py-3.5 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <Eye className="absolute right-4 top-4 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="text-right">
                <a href="#forgot" className="text-xs text-slate-400 hover:text-white">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 py-3.5 text-sm font-bold text-emerald-300 transition-all shadow-lg shadow-emerald-500/10"
              >
                {loading ? "Signing in..." : "Continue"}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4">
            Don't have an Account?{" "}
            <span onClick={() => handleAuth()} className="font-bold text-white cursor-pointer underline">
              Sign up
            </span>
          </div>
        </div>

        {/* Right Panel: Mint/Teal Gradient Brand Display */}
        <div className="relative p-10 flex flex-col items-center justify-center text-center bg-gradient-to-br from-teal-900 via-cyan-950 to-slate-950 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 space-y-6 max-w-sm">
            <h2 className="text-3xl font-black text-white tracking-wider">
              INTERVIEW WITH <span className="text-emerald-400">ABHI</span>
            </h2>


            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-6 backdrop-blur-md space-y-3">
              <div className="flex justify-center">
                <Sparkles className="h-8 w-8 text-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Mock Interview Practice</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Practice realistic interviews, improve every answer with AI feedback, and build the confidence needed to crack your next job interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

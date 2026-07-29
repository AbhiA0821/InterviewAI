import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Sparkles, Phone, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { signInWithGooglePopup, checkGoogleRedirectResult } from "../services/firebase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const payload = await checkGoogleRedirectResult();
        if (payload) {
          setLoading(true);
          await authService.loginWithGoogle(payload);
          sessionStorage.setItem("google_authenticated", "true");
          navigate("/");
        }
      } catch (err) {
        console.warn("Error handling Google redirect result:", err);
      } finally {
        setLoading(false);
      }
    };
    handleRedirectResult();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const authPayload = await signInWithGooglePopup();
      if (authPayload) {
        await authService.loginWithGoogle(authPayload);
        sessionStorage.setItem("google_authenticated", "true");
        navigate("/");
      }
    } catch (err: any) {
      console.warn("Google authentication error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in window was closed. Please select your Google account to log in.");
      } else {
        setError("Google sign-in error. Please click 'Sign in with Google' again or use Mobile OTP below.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError("Please enter a valid mobile phone number.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { sendPhoneOtp } = await import("../services/firebase");
      const result = await sendPhoneOtp(cleanPhone);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      console.error("Error sending phone OTP:", err);
      setError(err.message || "Failed to send SMS OTP code to this mobile number. Please check format (e.g. 9876543210).");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP code sent to your mobile phone.");
      return;
    }
    if (!confirmationResult) {
      setError("OTP session expired. Please request a new OTP.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { verifyPhoneOtp } = await import("../services/firebase");
      const authPayload = await verifyPhoneOtp(confirmationResult, otp.trim());
      await authService.loginWithGoogle(authPayload);
      sessionStorage.setItem("google_authenticated", "true");
      navigate("/");
    } catch (err: any) {
      console.error("Error verifying phone OTP:", err);
      setError("Invalid OTP code. Please check your SMS code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 font-sans selection:bg-emerald-500/30">
      {/* Invisible Recaptcha Container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-[#0e131f] shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left Panel: EXCLUSIVELY Google & Mobile Phone Number Login Options */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-[#0b0f19]">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Firebase Authentication
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sign in to Interview with Abhi
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Choose your preferred sign-in method to start your practice session
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/80 p-3 text-xs text-red-300 font-semibold text-center">
                {error}
              </div>
            )}

            {/* OPTION 1: Google Account Sign-In */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Sign in with Google
              </span>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/90 p-4 hover:border-emerald-500/80 hover:bg-slate-800 transition-all shadow-xl active:scale-98 group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-inner">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                      Sign in with Google
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Select Google Account
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                  Google
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-[#0b0f19] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                OR
              </span>
            </div>

            {/* OPTION 2: Mobile Phone Number OTP Sign-In */}
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Sign in with Mobile Phone Number
              </span>

              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile Phone (e.g. 9876543210)"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-semibold"
                    />
                    <Phone className="absolute right-4 top-4 h-4 w-4 text-slate-400" />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone.trim()}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 py-3.5 text-xs font-black text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? "Sending SMS OTP..." : "Send Mobile SMS OTP"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                  <div className="text-xs text-slate-300 font-semibold">
                    Enter 6-digit OTP sent to <span className="font-bold text-emerald-400">{phone}</span>:
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-2xl border border-emerald-500/70 bg-slate-900 px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !otp.trim()}
                      className="w-2/3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 text-xs font-black text-white transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      <span>{loading ? "Verifying..." : "Verify OTP & Sign In"}</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 font-medium">
            Protected by Firebase Google & Phone Verification
          </div>
        </div>

        {/* Right Panel: Mint/Teal Gradient Brand Display */}
        <div className="relative p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 overflow-hidden border-t md:border-t-0 md:border-l border-slate-800">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-sm">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              INTERVIEW WITH <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">ABHI</span>
            </h2>

            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-6 backdrop-blur-md space-y-3 shadow-xl">
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
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService, UserProfile } from "../../services/authService";
import { Bot, FileText, History, LogIn, LogOut, Mic, Sparkles, UserCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchUser();
  }, [location.pathname]);

  const fetchUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data.authenticated) {
        setCurrentUser(data);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    }
  };

  const handleSignOut = () => {
    authService.logout();
    sessionStorage.removeItem("google_authenticated");
    setCurrentUser(null);
    navigate("/login");
  };

  // On Live Interview Call page, hide top Navbar completely for immersive fullscreen video deck
  if (location.pathname.startsWith("/interview/")) {
    return null;
  }

  // On Login page, render ONLY clean Brand logo header without navigation tabs or profile badge
  if (location.pathname === "/login") {

    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-center px-4">
          <Link to="/login" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Interview with Abhi
            </span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 font-black text-xl tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25">
            <Bot className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent font-black tracking-wide">
            InterviewAI <span className="text-xs font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40 ml-1">Pro</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/")
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/dashboard")
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/upload"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/upload")
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Resume Setup</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/history")
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </Link>

          {/* Authenticated User Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                {currentUser.photo_url ? (
                  <img src={currentUser.photo_url} alt="Profile" className="h-5 w-5 rounded-full object-cover border border-emerald-400/50" />
                ) : (
                  <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
                <div className="flex flex-col text-left">
                  <span className="truncate max-w-[120px] font-extrabold text-white leading-none">
                    {currentUser.display_name}
                  </span>
                  <span className="truncate max-w-[120px] text-[10px] text-slate-400 font-mono mt-0.5">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 transition-all"
            >
              <LogIn className="h-4 w-4 text-emerald-400" />
              <span>Sign in</span>
            </Link>
          )}

          <Link
            to="/upload"
            className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Mic className="h-4 w-4" />
            <span>Start Practice</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

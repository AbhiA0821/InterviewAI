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
              Interview with Abhi Authentication
            </span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Interview with Abhi
          </span>
        </Link>


        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("/")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/upload"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("/upload")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Resume Upload</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("/history")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </Link>

          {/* Authenticated Google Account Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-border/60">
              <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="truncate max-w-[130px] font-bold text-foreground leading-none">
                    {currentUser.display_name}
                  </span>
                  <span className="truncate max-w-[130px] text-[10px] text-indigo-300 opacity-80 mt-0.5">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
            >
              <LogIn className="h-4 w-4 text-indigo-400" />
              <span>Sign in with Google</span>
            </Link>
          )}

          <Link
            to="/upload"
            className="ml-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 hover:shadow-indigo-500/35"
          >
            <Mic className="h-4 w-4" />
            <span>Start Practice</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

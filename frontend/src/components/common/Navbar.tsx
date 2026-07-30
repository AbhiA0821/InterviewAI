import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService, UserProfile } from "../../services/authService";
import { Bot, Edit3, History, LogIn, LogOut, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

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

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    try {
      const updated = await authService.updateProfile(newUsername.trim());
      setCurrentUser((prev) => prev ? { ...prev, display_name: updated.display_name } : updated);
      setIsEditingUsername(false);
    } catch (err) {
      console.warn("Failed to update username:", err);
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
            Interview with Abhi <span className="text-xs font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40 ml-1">Pro</span>
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

          <Link
            to="/admin"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/admin")
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Admin</span>
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

                <button
                  type="button"
                  onClick={() => {
                    setNewUsername(currentUser.display_name || "");
                    setIsEditingUsername(true);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-850 transition-all ml-1"
                  title="Edit Profile Username (Saved in Database)"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
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
        </nav>
      </div>

      {/* Edit Username Modal */}
      {isEditingUsername && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleUpdateUsername} className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-emerald-400" />
                <span>Update Username</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingUsername(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Profile Username (Saved to Database)</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingUsername(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-800 text-slate-300 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-white shadow-md"
              >
                Save to Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bot, Edit3, History, LayoutDashboard, LogIn, LogOut, ShieldCheck, UserCheck, Activity } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, updateDisplayName } = useAuth();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const isActive = (path: string) => location.pathname === path;

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    try {
      await updateDisplayName(newUsername.trim());
      setIsEditingUsername(false);
    } catch (err) {
      console.warn("Failed to update username:", err);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  // On Live Interview Call page, hide top Navbar completely for immersive fullscreen video deck
  if (location.pathname.startsWith("/interview/")) {
    return null;
  }

  // On Login page, render ONLY clean Brand logo header without navigation tabs or profile badge
  if (location.pathname === "/login") {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-center px-4">
          <Link to="/login" className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Bot className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent font-black tracking-wide">
              InterviewAI
            </span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/75 shadow-lg shadow-black/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 font-black text-xl tracking-tight group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Bot className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent font-black tracking-wide">
              InterviewAI
            </span>
            <Badge variant="emerald" dot className="hidden sm:inline-flex text-[10px]">
              AI System Ready
            </Badge>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/dashboard")
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/history")
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
            }`}
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </Link>

          <Link
            to="/admin"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive("/admin")
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Admin</span>
          </Link>

          {/* Authenticated User Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:border-slate-700 transition-colors">
                {currentUser.photo_url ? (
                  <img
                    src={currentUser.photo_url}
                    alt="Profile"
                    className="h-5 w-5 rounded-full object-cover border border-emerald-400/50"
                  />
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
                  className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all ml-1"
                  title="Edit Profile Username"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/50 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="emerald" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                Sign in
              </Button>
            </Link>
          )}
        </nav>
      </div>

      {/* Edit Username Modal using UI primitive */}
      <Modal
        isOpen={isEditingUsername}
        onClose={() => setIsEditingUsername(false)}
        title="Update Profile Username"
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateUsername} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Profile Display Name</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingUsername(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </header>
  );
};


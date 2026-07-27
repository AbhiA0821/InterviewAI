import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot, FileText, History, Mic, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            InterviewAI
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

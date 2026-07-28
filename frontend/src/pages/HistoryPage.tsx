import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { interviewService } from "../services/interviewService";
import { ArrowRight, Calendar, History, Loader2, Mic, Trophy } from "lucide-react";

interface HistoryItem {
  id: number;
  target_role: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  overall_score?: number;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await interviewService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-slate-300 font-extrabold tracking-wide text-sm">Loading interview history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interview History</h1>
          <p className="text-sm text-slate-400 mt-1">Review your past practice sessions and scorecards</p>
        </div>

        <button
          onClick={() => navigate("/upload")}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Mic className="h-4 w-4" />
          <span>New Practice Session</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/60 p-12 text-center space-y-4 shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 mx-auto">
            <History className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">No Interview Practice Yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Start your first AI interview practice session to build confidence and receive structured feedback.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <span>Start Practice Interview</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/feedback/${item.id}`)}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/90 p-5 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-xl flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">
                    {item.target_role}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase ${
                      item.status === "completed" && (item.overall_score ?? 0) > 0
                        ? "bg-emerald-950/90 text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-950/90 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {item.status === "completed" && (item.overall_score ?? 0) > 0
                      ? "completed"
                      : "incomplete"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {item.started_at
                      ? new Date(item.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {item.overall_score !== undefined && item.overall_score !== null && (
                  <div
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-black text-sm shadow-sm ${
                      item.overall_score > 0
                        ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-300"
                        : "border-amber-500/40 bg-amber-950/80 text-amber-300"
                    }`}
                  >
                    <Trophy
                      className={`h-4 w-4 ${
                        item.overall_score > 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    />
                    <span>{Math.round(item.overall_score)}/100</span>
                  </div>
                )}
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

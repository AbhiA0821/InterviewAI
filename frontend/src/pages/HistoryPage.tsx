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
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground font-medium">Loading interview history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview History</h1>
          <p className="text-sm text-muted-foreground">Review your past practice sessions and scorecards</p>
        </div>

        <button
          onClick={() => navigate("/upload")}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-500"
        >
          <Mic className="h-4 w-4" />
          <span>New Practice Session</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto">
            <History className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No Interview Practice Yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start your first AI interview practice session to build confidence and receive structured feedback.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-500"
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
              className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-indigo-500/50 hover:shadow-lg flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-indigo-400 transition-colors">
                    {item.target_role}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
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
                  <div className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-indigo-300 font-bold text-sm">
                    <Trophy className="h-4 w-4 text-indigo-400" />
                    <span>{Math.round(item.overall_score)}/100</span>
                  </div>
                )}
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

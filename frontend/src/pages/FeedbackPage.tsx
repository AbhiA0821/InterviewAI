import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { feedbackService, FeedbackReport } from "../services/feedbackService";
import { AlertCircle, ArrowLeft, Award, CheckCircle2, ChevronDown, ChevronUp, Cpu, Lightbulb, Loader2, MessageSquare, RotateCcw, Sparkles, Trophy } from "lucide-react";

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getFeedback(Number(id));
      setReport(data);
    } catch (err: any) {
      setError("Failed to load feedback report.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground font-medium">Evaluating performance & generating AI scorecard...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">{error || "Report unavailable."}</p>
        <button onClick={() => navigate("/")} className="text-indigo-400 underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 70) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/30";
    return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">
            AI Interview Scorecard & Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Target Role: <span className="font-medium text-indigo-400">{report.target_role}</span>
          </p>
        </div>

        <button
          onClick={() => navigate("/upload")}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-500"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Practice Another Role</span>
        </button>
      </div>

      {/* Main Score & Recommendation Banner */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-background to-violet-950/30 p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Award className="h-4 w-4" />
              <span>Recommendation: {report.detailed_report?.recommendation || "Hire"}</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Overall Performance Rating
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              {report.detailed_report?.summary ||
                "Solid overall presentation with clear structure and technical awareness."}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-indigo-500/40 bg-indigo-500/10 shadow-2xl shadow-indigo-500/20">
              <span className="text-4xl font-extrabold text-indigo-300">
                {Math.round(report.overall_score)}
                <span className="text-lg text-indigo-400/80">/100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Metric Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Technical Skills", score: report.technical_score ?? 80, icon: Cpu },
          { title: "Communication", score: report.communication_score ?? 85, icon: MessageSquare },
          { title: "Problem Solving", score: report.problem_solving_score ?? 82, icon: Lightbulb },
          { title: "Confidence", score: report.confidence_score ?? 88, icon: Trophy },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${getScoreColor(
                    metric.score
                  )}`}
                >
                  {Math.round(metric.score)}%
                </span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground">{metric.title}</h3>
                <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, metric.score))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
            <CheckCircle2 className="h-6 w-6" />
            <h3>Key Strengths</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-foreground">
            {report.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
            <AlertCircle className="h-6 w-6" />
            <h3>Areas for Improvement</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-foreground">
            {report.areas_for_improvement?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interview Transcript Accordion */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between font-semibold text-lg text-foreground"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>View Full Interview Transcript</span>
          </div>
          {showTranscript ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {showTranscript && (
          <div className="space-y-3 pt-4 border-t border-border/60 max-h-96 overflow-y-auto pr-2">
            {report.transcript?.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl text-sm ${
                  item.role === "user"
                    ? "bg-purple-600/10 border border-purple-500/20 text-foreground ml-6"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-foreground mr-6"
                }`}
              >
                <div className="font-semibold text-xs text-muted-foreground mb-1">
                  {item.role === "user" ? "Candidate" : "AI Interviewer"}
                </div>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

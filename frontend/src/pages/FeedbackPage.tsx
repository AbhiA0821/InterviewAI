import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { feedbackService, FeedbackReport } from "../services/feedbackService";
import { saveInterviewResultToFirestore } from "../services/firestoreService";
import { AlertCircle, ArrowLeft, Award, CheckCircle2, ChevronDown, ChevronUp, Cpu, Lightbulb, Loader2, MessageSquare, Printer, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

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

      try {
        const storedUserJson = localStorage.getItem("user");
        const currentCandidateUser = storedUserJson ? JSON.parse(storedUserJson) : null;
        const candidateName = localStorage.getItem("user_display_name") || currentCandidateUser?.display_name || "Candidate";
        const candidateEmail = currentCandidateUser?.email || "candidate@interviewai.com";
        const candidateUid = currentCandidateUser?.uid || localStorage.getItem("user_uid") || `user_${Date.now()}`;

        await saveInterviewResultToFirestore({
          uid: candidateUid,
          username: candidateName,
          email: candidateEmail,
          interviewDomain: data.target_role || "Software Engineer",
          difficulty: "Standard",
          totalQuestions: data.transcript ? Math.max(1, Math.floor(data.transcript.length / 2)) : 5,
          correctAnswers: Math.round(((data.overall_score || 85) / 100) * 5),
          score: data.overall_score || 85,
          percentage: `${data.overall_score || 85}%`,
          overallFeedback: data.detailed_report?.summary || "Completed mock interview session.",
          strengths: data.strengths || [],
          weaknesses: data.areas_for_improvement || [],
          interviewDate: new Date().toLocaleDateString(),
          interviewDuration: localStorage.getItem("selected_duration") || "5 mins",
        });
      } catch (fsErr) {
        console.warn("[Firestore] Auto-save scorecard notice:", fsErr);
      }
    } catch (err: any) {
      setError("Failed to load feedback report.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-slate-300 font-extrabold tracking-wide text-sm">Evaluating performance & generating AI scorecard...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-rose-400 font-bold">{error || "Report unavailable."}</p>
        <Button variant="emerald" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isIncomplete = report.overall_score === 0 || report.detailed_report?.recommendation?.includes("Incomplete");

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Interview Scorecard & Feedback
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Target Role: <span className="font-bold text-emerald-400">{report.target_role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="h-4 w-4 text-slate-400" />}
          >
            Print Report
          </Button>

          <Button
            variant="emerald"
            size="sm"
            onClick={() => navigate("/upload")}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Practice Another Role
          </Button>
        </div>
      </div>

      {/* Main Score & Recommendation Banner */}
      <Card
        variant="gradient"
        glow={isIncomplete ? "none" : "emerald"}
        className={`p-8 relative overflow-hidden ${
          isIncomplete
            ? "border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/40"
            : "border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/40"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <Badge variant={isIncomplete ? "amber" : "emerald"} dot className="px-3.5 py-1">
              <Award className="h-4 w-4" />
              <span>Recommendation: {report.detailed_report?.recommendation || (isIncomplete ? "Incomplete" : "Needs Improvement")}</span>
            </Badge>

            <h2 className="text-2xl font-black text-white">
              Overall Performance Rating
            </h2>
            <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              {report.detailed_report?.summary || "No evaluation summary available."}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 shadow-2xl ${
              isIncomplete
                ? "border-amber-500/50 bg-amber-950/60 shadow-amber-500/20 text-amber-300"
                : "border-emerald-500/50 bg-emerald-950/60 shadow-emerald-500/20 text-emerald-300"
            }`}>
              <span className="text-4xl font-black">
                {Math.round(report.overall_score ?? 0)}
                <span className={`text-lg ${isIncomplete ? "text-amber-400/80" : "text-emerald-400/80"}`}>/100</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Metric Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Technical Skills", score: report.technical_score ?? 0, icon: Cpu },
          { title: "Communication", score: report.communication_score ?? 0, icon: MessageSquare },
          { title: "Problem Solving", score: report.problem_solving_score ?? 0, icon: Lightbulb },
          { title: "Confidence", score: report.confidence_score ?? 0, icon: Trophy },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} variant="glass" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={metric.score >= 70 ? "emerald" : "amber"}>
                  {Math.round(metric.score)}%
                </Badge>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400">{metric.title}</h3>
                <div className="w-full bg-slate-950 h-2.5 rounded-full mt-2 overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metric.score > 0
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-slate-700"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass" className="p-6 space-y-4 border-emerald-500/30">
          <div className="flex items-center gap-2.5 text-emerald-400 font-black text-lg">
            <CheckCircle2 className="h-6 w-6" />
            <h3>Key Strengths</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-200 font-medium">
            {report.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="glass" className="p-6 space-y-4 border-amber-500/30">
          <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg">
            <AlertCircle className="h-6 w-6" />
            <h3>Areas for Improvement</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-200 font-medium">
            {report.areas_for_improvement?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Interview Transcript Accordion */}
      <Card variant="glass" className="p-6 space-y-4">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between font-extrabold text-lg text-white"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span>View Full Interview Transcript & Log</span>
          </div>
          {showTranscript ? <ChevronUp className="h-5 w-5 text-emerald-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>

        {showTranscript && (
          <div className="space-y-3 pt-4 border-t border-slate-800 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {report.transcript?.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs sm:text-sm border ${
                  item.role === "user"
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-100 ml-4 sm:ml-8"
                    : "bg-slate-950 border-slate-800 text-slate-200 mr-4 sm:mr-8"
                }`}
              >
                <div className="font-extrabold text-[10px] uppercase text-slate-400 mb-1">
                  {item.role === "user" ? "You (Candidate)" : "AI Interviewer"}
                </div>
                <p className="font-medium leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


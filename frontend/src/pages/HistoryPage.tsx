import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { interviewService } from "../services/interviewService";
import { getUserInterviewsFromFirestore, FirestoreInterviewResult } from "../services/firestoreService";
import { exportInterviewsToExcel, ExcelInterviewRow } from "../utils/excelExport";
import {
  ArrowRight,
  Calendar,
  FileSpreadsheet,
  Filter,
  History,
  Loader2,
  Mic,
} from "lucide-react";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [firestoreHistory, setFirestoreHistory] = useState<FirestoreInterviewResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await interviewService.getHistory();
      setHistory(data || []);

      // Fetch logged-in user's Firestore records
      const storedUserJson = localStorage.getItem("user");
      const userObj = storedUserJson ? JSON.parse(storedUserJson) : null;
      const userUid = userObj?.uid || localStorage.getItem("user_uid") || "";

      if (userUid) {
        const fsRecords = await getUserInterviewsFromFirestore(userUid);
        setFirestoreHistory(fsRecords);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Combine & Filter candidate history items
  const combinedItems = useMemo(() => {
    const list: any[] = [];

    // Add Firestore items
    firestoreHistory.forEach((fs) => {
      list.push({
        id: fs.id || `fs_${Math.random()}`,
        target_role: fs.interviewDomain,
        status: "completed",
        overall_score: fs.score,
        started_at: fs.interviewDate,
        duration: fs.interviewDuration,
        feedback: fs.overallFeedback,
        strengths: fs.strengths,
        weaknesses: fs.weaknesses,
        percentage: fs.percentage,
        isFirestore: true,
      });
    });

    // Add SQLite backend items if not duplicated
    history.forEach((h) => {
      if (!list.some((existing) => existing.target_role === h.target_role && existing.overall_score === h.overall_score)) {
        list.push({
          id: h.id,
          target_role: h.target_role,
          status: h.status,
          overall_score: h.overall_score,
          started_at: h.started_at ? new Date(h.started_at).toLocaleDateString() : new Date().toLocaleDateString(),
          duration: "5 mins",
          feedback: "Completed practice round.",
          strengths: ["Technical Communication"],
          weaknesses: ["Deep metrics elaboration"],
          percentage: `${h.overall_score || 85}%`,
          isFirestore: false,
        });
      }
    });

    return list;
  }, [history, firestoreHistory]);

  const availableDomains = useMemo(() => {
    const setDom = new Set<string>();
    combinedItems.forEach((i) => {
      if (i.target_role) setDom.add(i.target_role);
    });
    return ["All", ...Array.from(setDom)];
  }, [combinedItems]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const matchesDomain = selectedDomain === "All" || item.target_role === selectedDomain;
      let matchesDate = true;
      if (selectedDateFilter === "Today") {
        const todayStr = new Date().toLocaleDateString();
        matchesDate = item.started_at === todayStr;
      }
      return matchesDomain && matchesDate;
    });
  }, [combinedItems, selectedDomain, selectedDateFilter]);

  const handleExportCandidateExcel = () => {
    const candidateName = localStorage.getItem("user_display_name") || "Candidate";
    const candidateEmail = localStorage.getItem("user_email") || "candidate@interviewai.com";

    const rows: ExcelInterviewRow[] = filteredItems.map((item) => ({
      Username: candidateName,
      Email: candidateEmail,
      "Interview Domain": item.target_role,
      Difficulty: "Standard",
      Score: item.overall_score || 85,
      Percentage: item.percentage || `${item.overall_score || 85}%`,
      Date: item.started_at || new Date().toLocaleDateString(),
      Duration: item.duration || "5 mins",
      "AI Overall Feedback": item.feedback || "Completed session",
      Strengths: item.strengths?.join("; ") || "",
      "Areas for Improvement": item.weaknesses?.join("; ") || "",
    }));

    exportInterviewsToExcel(rows, "My_Interview_History.xlsx");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-slate-300 font-extrabold tracking-wide text-sm">Loading interview history & scorecards...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 text-slate-100 selection:bg-emerald-500/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Interview History</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Review your past practice sessions, AI scorecards, strengths, and analytical progress</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCandidateExcel}
            disabled={!filteredItems.length}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all disabled:opacity-40"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Download My Excel</span>
          </button>

          <button
            onClick={() => navigate("/upload")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Mic className="h-4 w-4" />
            <span>New Practice Session</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Filter className="h-4 w-4 text-emerald-400" />
          <span>Filter Candidate Records:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            {availableDomains.map((d) => (
              <option key={d} value={d}>
                Domain: {d}
              </option>
            ))}
          </select>

          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            <option value="All">Date: All Time</option>
            <option value="Today">Date: Today</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/60 p-12 text-center space-y-4 shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 mx-auto">
            <History className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">No Practice Records Found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Start an AI interview session to generate performance scorecards and build your practice history.
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
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                if (typeof item.id === "number") {
                  navigate(`/feedback/${item.id}`);
                }
              }}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/90 p-5 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">
                      {item.target_role}
                    </h3>
                    <span className="rounded-full bg-emerald-950 text-emerald-400 px-2.5 py-0.5 text-[10px] font-black uppercase border border-emerald-500/40">
                      Completed
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {item.started_at}
                    </span>
                    <span>• Duration: {item.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.overall_score !== undefined && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                      <span className="text-xl font-black text-emerald-400">
                        {item.overall_score}%
                      </span>
                    </div>
                  )}
                  <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Feedback Summary Snippet */}
              <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 font-medium">
                {item.feedback}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

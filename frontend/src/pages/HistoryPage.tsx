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
  Search,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [firestoreHistory, setFirestoreHistory] = useState<FirestoreInterviewResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await interviewService.getHistory();
      setHistory(data || []);

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

  const combinedItems = useMemo(() => {
    const list: any[] = [];

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
      const matchesSearch = searchQuery === "" || item.target_role.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesDate = true;
      if (selectedDateFilter === "Today") {
        const todayStr = new Date().toLocaleDateString();
        matchesDate = item.started_at === todayStr;
      }
      return matchesDomain && matchesSearch && matchesDate;
    });
  }, [combinedItems, selectedDomain, searchQuery, selectedDateFilter]);

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-slate-300 font-extrabold tracking-wide text-sm">Loading interview history & scorecards...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans text-slate-100 selection:bg-emerald-500/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Interview History</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Review your past practice sessions, AI scorecards, strengths, and analytical progress</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCandidateExcel}
            disabled={!filteredItems.length}
            leftIcon={<FileSpreadsheet className="h-4 w-4 text-emerald-400" />}
          >
            Download Excel
          </Button>

          <Button
            variant="emerald"
            size="sm"
            onClick={() => navigate("/upload")}
            leftIcon={<Mic className="h-4 w-4" />}
          >
            New Practice Session
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card variant="glass" className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Filter className="h-4 w-4 text-emerald-400" />
          <span>Filter Records:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role..."
              title="Search interview history by candidate target role"
              className="rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

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
      </Card>

      {filteredItems.length === 0 ? (
        <Card variant="glass" className="p-12 text-center space-y-4 border-dashed">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 mx-auto">
            <History className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">No Practice Records Found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Start an AI interview session to generate performance scorecards and build your practice history.
          </p>
          <Button
            variant="emerald"
            size="md"
            onClick={() => navigate("/upload")}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Start Practice Interview
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, idx) => (
            <Card
              key={item.id || idx}
              variant="glass-hover"
              onClick={() => {
                if (typeof item.id === "number") {
                  navigate(`/feedback/${item.id}`);
                }
              }}
              className="p-5 cursor-pointer space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">
                      {item.target_role}
                    </h3>
                    <Badge variant="emerald">
                      Completed
                    </Badge>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


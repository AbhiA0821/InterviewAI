import { useEffect, useState, useMemo } from "react";
import {
  getAllUsersFromFirestore,
  getAllInterviewsFromFirestore,
  FirestoreUser,
  FirestoreInterviewResult,
} from "../services/firestoreService";
import { exportInterviewsToExcel, ExcelInterviewRow } from "../utils/excelExport";
import {
  Users,
  Award,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Flame,
  Info,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCheck,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [interviews, setInterviews] = useState<FirestoreInterviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"score_desc" | "date_desc">("score_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected User Detail Modal State
  const [selectedResult, setSelectedResult] = useState<FirestoreInterviewResult | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, interviewsData] = await Promise.all([
        getAllUsersFromFirestore(),
        getAllInterviewsFromFirestore(),
      ]);

      setUsers(usersData);
      setInterviews(interviewsData);
    } catch (err: any) {
      console.warn("Error fetching admin dashboard data:", err);
      setError("Could not connect to Firestore database.");
    } finally {
      setLoading(false);
    }
  };

  // Analytics Calculations
  const totalUsersCount = users.length || (interviews.length ? new Set(interviews.map((i) => i.email)).size : 0);
  const totalInterviewsCount = interviews.length;

  const averageScore = useMemo(() => {
    if (!interviews.length) return 0;
    const sum = interviews.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(sum / interviews.length);
  }, [interviews]);

  const highestScore = useMemo(() => {
    if (!interviews.length) return 0;
    return Math.max(...interviews.map((i) => i.score || 0));
  }, [interviews]);

  const todayInterviewsCount = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    return interviews.filter((i) => i.interviewDate === todayStr || i.createdAt?.includes(new Date().toISOString().slice(0, 10))).length;
  }, [interviews]);

  // Unique Domains List
  const availableDomains = useMemo(() => {
    const setDomains = new Set<string>();
    interviews.forEach((i) => {
      if (i.interviewDomain) setDomains.add(i.interviewDomain);
    });
    return ["All", ...Array.from(setDomains)];
  }, [interviews]);

  // Domain Distribution Analytics Data
  const domainAnalytics = useMemo(() => {
    const map: Record<string, { count: number; totalScore: number }> = {};
    interviews.forEach((item) => {
      const dom = item.interviewDomain || "Software Engineer";
      if (!map[dom]) map[dom] = { count: 0, totalScore: 0 };
      map[dom].count += 1;
      map[dom].totalScore += item.score || 0;
    });
    return Object.entries(map).map(([domain, data]) => ({
      domain,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
    }));
  }, [interviews]);

  // Top 10 High Performers
  const topPerformers = useMemo(() => {
    return [...interviews].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  }, [interviews]);

  // Filtered & Sorted Table Records
  const filteredInterviews = useMemo(() => {
    return interviews
      .filter((item) => {
        const matchesQuery =
          !searchQuery.trim() ||
          item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.interviewDomain.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDomain = selectedDomain === "All" || item.interviewDomain === selectedDomain;

        let matchesDate = true;
        if (selectedDateFilter === "Today") {
          const todayStr = new Date().toLocaleDateString();
          matchesDate = item.interviewDate === todayStr;
        }

        return matchesQuery && matchesDomain && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "score_desc") {
          return (b.score || 0) - (a.score || 0);
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [interviews, searchQuery, selectedDomain, selectedDateFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage) || 1;
  const paginatedInterviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInterviews.slice(start, start + itemsPerPage);
  }, [filteredInterviews, currentPage]);

  // Excel Export Handler
  const handleExportExcel = () => {
    const exportRows: ExcelInterviewRow[] = filteredInterviews.map((item) => ({
      Username: item.username,
      Email: item.email,
      "Interview Domain": item.interviewDomain,
      Difficulty: item.difficulty,
      Score: item.score,
      Percentage: item.percentage,
      Date: item.interviewDate,
      Duration: item.interviewDuration,
      "AI Overall Feedback": item.overallFeedback,
      Strengths: item.strengths?.join("; ") || "",
      "Areas for Improvement": item.weaknesses?.join("; ") || "",
    }));

    exportInterviewsToExcel(exportRows, "Interview_Results.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 text-slate-100 selection:bg-emerald-500/30">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3.5 py-1 text-xs font-black text-emerald-300 shadow-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Admin Platform Control & Firestore Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Real-time candidate tracking, Firestore interview records, and analytical scorecards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> : <Sparkles className="h-4 w-4 text-emerald-400" />}
            <span>Refresh Firestore</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={!filteredInterviews.length}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-40 flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Users</span>
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalUsersCount}</div>
          <p className="text-[11px] text-slate-400 font-semibold">Registered Candidates</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Interviews</span>
            <BarChart3 className="h-5 w-5 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalInterviewsCount}</div>
          <p className="text-[11px] text-slate-400 font-semibold">Completed AI Practice Rounds</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Average Score</span>
            <Award className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{averageScore}%</div>
          <p className="text-[11px] text-slate-400 font-semibold">Candidate Benchmark</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Highest Score</span>
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{highestScore}%</div>
          <p className="text-[11px] text-slate-400 font-semibold">Top Performing Candidate</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Today's Sessions</span>
            <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{todayInterviewsCount}</div>
          <p className="text-[11px] text-slate-400 font-semibold">Conducted Today</p>
        </div>
      </div>

      {/* ANALYTICS CHARTS & TOP PERFORMERS SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Domain Distribution Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>Interviews & Average Score per Domain</span>
          </h3>

          <div className="space-y-3 pt-2">
            {domainAnalytics.map((item) => (
              <div key={item.domain} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">{item.domain}</span>
                  <span className="text-emerald-400 font-mono">
                    {item.count} sessions • {item.avgScore}% avg
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, (item.count / (totalInterviewsCount || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 High Performers Card */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Top 10 High Scoring Candidates</span>
          </h3>

          <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {topPerformers.map((candidate, idx) => (
              <div
                key={candidate.id || idx}
                onClick={() => setSelectedResult(candidate)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="h-6 w-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black">
                    #{idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-black text-white truncate">{candidate.username}</div>
                    <div className="text-[10px] text-slate-400 truncate">{candidate.interviewDomain}</div>
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  {candidate.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INTERVIEW RESULTS TABLE SECTION */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              <span>Candidate Interview Results Directory</span>
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Showing {filteredInterviews.length} candidate interview records stored in Firestore
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search username or email..."
                className="w-64 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 pl-9 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => { setSelectedDomain(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
            >
              {availableDomains.map((d) => (
                <option key={d} value={d}>
                  Domain: {d}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="score_desc">Sort: Highest Score</option>
              <option value="date_desc">Sort: Recent Date</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-200">
              {paginatedInterviews.length > 0 ? (
                paginatedInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-black text-white truncate max-w-[150px]">{item.username}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[180px]">{item.email}</td>
                    <td className="py-3 px-4 font-bold text-emerald-300">{item.interviewDomain}</td>
                    <td className="py-3 px-4 text-slate-300">{item.difficulty}</td>
                    <td className="py-3 px-4 font-black text-emerald-400">{item.score}</td>
                    <td className="py-3 px-4 font-extrabold text-teal-300">{item.percentage}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{item.interviewDate}</td>
                    <td className="py-3 px-4 text-slate-400">{item.interviewDuration}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedResult(item)}
                        className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold hover:bg-emerald-900 transition-all"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-bold">
                    No candidate interview records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-2">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 text-slate-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* USER INTERVIEW DETAIL POPUP MODAL */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedResult.username}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedResult.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedResult(null)}
                className="h-8 w-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Domain</span>
                <span className="text-xs font-black text-emerald-300">{selectedResult.interviewDomain}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Overall Score</span>
                <span className="text-sm font-black text-emerald-400">{selectedResult.score}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Date</span>
                <span className="text-xs font-bold text-slate-200">{selectedResult.interviewDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Duration</span>
                <span className="text-xs font-bold text-slate-200">{selectedResult.interviewDuration}</span>
              </div>
            </div>

            {/* AI Summary Feedback */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> AI Overall Feedback
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                {selectedResult.overallFeedback}
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedResult.strengths?.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="h-4 w-4" /> Areas for Improvement
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedResult.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-center gap-2 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

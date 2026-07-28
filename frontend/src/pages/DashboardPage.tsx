import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  FileCheck2,
  HardHat,
  Lightbulb,
  Mic,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Video,
  Wrench,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();

  // Role Auto-Suggest State
  const [selectedRole, setSelectedRole] = useState("Full Stack Software Engineer");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const curatedRoles = [
    "Full Stack Software Engineer",
    "AI / Machine Learning Specialist",
    "Frontend React & TypeScript Developer",
    "Backend Python & FastAPI Engineer",
    "Cloud Architect & DevOps Specialist",
    "Data Analyst & Business Intelligence Lead",
    "Cybersecurity & Infrastructure Specialist",
    "Product Manager & Technical Lead",
    "Mobile App Developer (iOS / React Native)",
    "QA Automation & Testing Engineer",
    "Embedded Systems & Hardware Engineer",
    "System Architecture & Database Engineer",
  ];

  const filteredRoles = curatedRoles.filter((r) =>
    r.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const engineeringBranches = [
    { title: "Software & Web Engineering", icon: Code2, branch: "CSE / IT" },
    { title: "AI & Machine Learning Lead", icon: Sparkles, branch: "AI & DS" },
    { title: "Mechanical & Robotics", icon: Wrench, branch: "Mech" },
    { title: "Electronics & Hardware (ECE / EEE)", icon: Cpu, branch: "ECE / EEE" },
    { title: "Civil & Infrastructure", icon: HardHat, branch: "Civil" },
    { title: "Chemical & Process Engineering", icon: Building2, branch: "Chemical" },
    { title: "Data Analytics & BI Lead", icon: Lightbulb, branch: "Analytics" },
    { title: "Product & Engineering Management", icon: Briefcase, branch: "Management" },
  ];

  const handleLaunchRoleInterview = (roleName: string) => {
    navigate(`/upload?role=${encodeURIComponent(roleName)}`);
  };

  return (
    <div className="space-y-10 pb-16 font-sans text-slate-100 selection:bg-emerald-500/30">
      {/* HIGH-CONTRAST VIBRANT HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 md:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-md backdrop-blur">
            <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>AI Voice & Photorealistic Avatars • Simli WebRTC & Canvas Lip-Sync</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Master Mock Interviews with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Real-time AI Video Avatars
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
            Experience face-to-face mock interview calls with AI Tech Lead{" "}
            <span className="font-bold text-emerald-300 underline decoration-emerald-500/40">Riya</span> or AI Engineer{" "}
            <span className="font-bold text-emerald-300 underline decoration-emerald-500/40">Rohan</span>. Automatic resume parsing, device mirror room pre-check, and multi-metric scorecards.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => handleLaunchRoleInterview(selectedRole)}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-8 py-4 text-base font-black text-white shadow-2xl shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-emerald-500/50"
            >
              <Mic className="h-5 w-5" />
              <span>Start Practice Session</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-7 py-4 text-base font-extrabold text-slate-200 shadow-md transition-all hover:bg-slate-800 hover:border-emerald-500/40"
            >
              <Trophy className="h-5 w-5 text-emerald-400" />
              <span>View Scorecard Analytics</span>
            </button>
          </div>
        </div>
      </section>

      {/* SEARCHABLE TARGET ROLE DROPDOWN & AUTO-SUGGESTION SECTION */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-400" />
              <span>Target Interview Role Selection</span>
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Select or search for your exact job role to generate custom AI interview questions
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/40 self-start md:self-auto">
            <Sparkles className="h-3.5 w-3.5" /> 20+ Tech Domains Available
          </span>
        </div>

        {/* Interactive Searchable Dropdown */}
        <div className="relative max-w-2xl">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white cursor-pointer shadow-inner hover:border-emerald-500/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-emerald-400" />
              <span>{selectedRole}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </div>

          {/* Autocomplete Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-16 left-0 right-0 z-40 rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-2xl space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to filter roles (e.g. Frontend, DevOps, ML)..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                autoFocus
              />

              <div className="max-h-56 overflow-y-auto space-y-1">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <div
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setIsDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${
                        selectedRole === role
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <span>{role}</span>
                      {selectedRole === role && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500 font-semibold">
                    No matching roles found. You can type a custom role in setup.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Role Tags */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-400 block">Popular Role Suggestions:</span>
          <div className="flex flex-wrap gap-2">
            {curatedRoles.slice(0, 6).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedRole === role
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Launch Selected Role Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => handleLaunchRoleInterview(selectedRole)}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-xl transition-all flex items-center gap-2"
          >
            <span>Practice Interview for "{selectedRole}"</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* DETAILED ANALYTICAL SCORECARD & PERFORMANCE BREAKDOWN */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <span>Candidate Analytical Performance Scorecard</span>
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Real-time multi-metric AI evaluation aggregated across past sessions
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/90 px-4 py-2 rounded-full border border-emerald-500/50 text-emerald-300 text-xs font-black shadow-md self-start sm:self-auto">
            <span>Overall Grade:</span>
            <span className="text-emerald-400 underline">A+ • Ready to Hire (88.5 Score)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Metric 1: Technical Knowledge & Accuracy */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
              <span className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Technical Accuracy & Depth</span>
              </span>
              <span className="text-emerald-400 font-mono">88%</span>
            </div>
            <div className="bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[88%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Strong understanding of core algorithms, system architecture, and domain concepts.</p>
          </div>

          {/* Metric 2: Communication Skills */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
              <span className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-teal-400" />
                <span>Communication & Speech Clarity</span>
              </span>
              <span className="text-teal-400 font-mono">92%</span>
            </div>
            <div className="bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full w-[92%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Articulate speech delivery, structured STAR answers, and professional tone.</p>
          </div>

          {/* Metric 3: Analytical Problem Solving */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-400" />
                <span>Analytical & Problem Solving</span>
              </span>
              <span className="text-indigo-400 font-mono">84%</span>
            </div>
            <div className="bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-400 h-full rounded-full w-[84%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Logical trade-off evaluation, edge case consideration, and systematic breakdown.</p>
          </div>

          {/* Metric 4: Confidence & Delivery */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                <span>Confidence & Response Delivery</span>
              </span>
              <span className="text-amber-400 font-mono">90%</span>
            </div>
            <div className="bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full w-[90%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Poised delivery, minimal filler words, and steady composure under follow-up questions.</p>
          </div>
        </div>
      </section>

      {/* ENGINEERING SPECIALIZATION COMMAND CENTER */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Engineering Specialization Command Center
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            Select your specific engineering branch to start customized questions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {engineeringBranches.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                onClick={() => handleLaunchRoleInterview(item.title)}
                className="group relative cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                    {item.branch}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">5 Tailored Questions + Scorecard</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURE HIGHLIGHT CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 shadow-xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Video className="h-5 w-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">Photorealistic AI Avatars</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Real-time widescreen AI video call stage with realistic lip-sync, phoneme mouth movements, and Indian English speech synthesis.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 shadow-xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">Automated Resume Parsing</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Extracts candidate technical skills and experience from PDF resumes to generate custom-tailored interview questions.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 shadow-xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">Multi-Metric Scorecard</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Instant AI evaluation breakdown across Technical Accuracy, Communication Clarity, Analytical Logic, and Confidence.
          </p>
        </div>
      </section>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Briefcase, Building2, CheckCircle2, Code2, Cpu, FileCheck2, HardHat, Lightbulb, Mic, Sparkles, Trophy, UserCheck, Wrench, Zap } from "lucide-react";


export default function DashboardPage() {
  const navigate = useNavigate();

  const engineeringBranches = [
    { title: "Computer Science - Software Engineer", icon: Code2, branch: "CSE / IT", color: "indigo" },
    { title: "AI / Machine Learning Engineer", icon: Sparkles, branch: "AI & DS", color: "violet" },
    { title: "Mechanical Engineering", icon: Wrench, branch: "Mech", color: "purple" },
    { title: "Electrical & Electronics (ECE / EEE)", icon: Cpu, branch: "ECE / EEE", color: "indigo" },
    { title: "Civil & Structural Engineering", icon: HardHat, branch: "Civil", color: "violet" },
    { title: "Chemical & Process Engineering", icon: Building2, branch: "Chemical", color: "purple" },
    { title: "Data Analyst & Business Intelligence", icon: Lightbulb, branch: "Analytics", color: "indigo" },
    { title: "Product Manager & Technical Lead", icon: Briefcase, branch: "Management", color: "violet" },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-card to-violet-950/40 p-8 md:p-12 border border-indigo-500/30 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-4 py-1.5 text-xs font-semibold text-indigo-300">
            <Zap className="h-3.5 w-3.5" />
            <span>AI Voice & Widescreen Video Avatars • Google OAuth Enabled</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Master Technical & HR Interviews with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Real-time AI Avatars
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Practice live face-to-face voice interviews with Indian AI Avatars (Priya & Rohan), complete customized technical drills for all engineering branches, and receive instant scorecards.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate("/upload")}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:shadow-indigo-600/40"
            >
              <Mic className="h-5 w-5" />
              <span>Start Practice Session</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-base font-semibold text-card-foreground shadow-sm transition-all hover:bg-accent"
            >
              <Trophy className="h-5 w-5 text-indigo-400" />
              <span>View Past Scorecards</span>
            </button>
          </div>
        </div>
      </section>

      {/* Select Practice Mode */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          Select Interview Practice Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/upload")}
            className="cursor-pointer rounded-3xl border border-indigo-500/30 bg-card p-6 space-y-3 shadow-md hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Core Technical Interview</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deep dive into engineering fundamentals, system design, architectural tradeoffs, and domain expertise.
            </p>
          </div>

          <div
            onClick={() => navigate("/upload")}
            className="cursor-pointer rounded-3xl border border-violet-500/30 bg-card p-6 space-y-3 shadow-md hover:border-violet-500/60 hover:-translate-y-1 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">HR & Behavioral Practice</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Master workplace scenario questions, conflict resolution, salary expectations, and cultural fit.
            </p>
          </div>

          <div
            onClick={() => navigate("/upload")}
            className="cursor-pointer rounded-3xl border border-purple-500/30 bg-card p-6 space-y-3 shadow-md hover:border-purple-500/60 hover:-translate-y-1 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Non-Technical & Aptitude</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Analytical reasoning, decision making under pressure, project management, and team communication.
            </p>
          </div>
        </div>
      </section>

      {/* All Engineering Branches Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Engineering Branch Launchpad
            </h2>
            <p className="text-xs text-muted-foreground">Select your engineering branch to launch practice</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {engineeringBranches.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                onClick={() => navigate("/upload")}
                className="group relative cursor-pointer rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                    {item.branch}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">5 Tailored AI Questions + Scorecard</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">AI Avatars (Priya & Rohan)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Real-time widescreen AI video avatars with Indian English accents and speech micro-motion.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">PyMuPDF Resume Parsing</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Extracts your exact skills and experience from PDF resumes to ask custom-tailored questions.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Multi-Metric Scorecard</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Instant evaluation breakdown across Technical Knowledge, Communication, Problem Solving, and Confidence.
          </p>
        </div>
      </section>
    </div>
  );
}

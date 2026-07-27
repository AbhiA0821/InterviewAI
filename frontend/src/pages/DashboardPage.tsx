import { useNavigate } from "react-router-dom";

import { Bot, Brain, CheckCircle2, Code2, Cpu, FileCheck2, Mic, Sparkles, Trophy, Zap } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();

  const sampleRoles = [
    { title: "Fullstack Engineer", icon: Code2, badge: "Popular" },
    { title: "Backend Engineer", icon: Cpu, badge: "High Demand" },
    { title: "Data Scientist / AI Engineer", icon: Brain, badge: "Hot" },
    { title: "Product Manager", icon: Sparkles, badge: "Trending" },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/40 via-background to-background p-8 md:p-14 border border-indigo-500/20 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400">
            <Zap className="h-3.5 w-3.5" />
            <span>Powered by Gemini 2.0 & PyMuPDF</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Master Technical & Behavioral Interviews with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              AI Speech Real-time
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Upload your resume, pick your target job role, and take an interactive, voice-assisted AI interview tailored to your experience. Get instant AI scorecards & actionable feedback.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate("/upload")}
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:shadow-indigo-600/40"
            >
              <Mic className="h-5 w-5" />
              <span>Start Practice Interview</span>
            </button>
            <button
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-card-foreground shadow-sm transition-all hover:bg-accent"
            >
              <Trophy className="h-5 w-5 text-indigo-400" />
              <span>View Past Scorecards</span>
            </button>
          </div>
        </div>
      </section>

      {/* Target Roles Quick Launch */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Select Target Job Role</h2>
            <p className="text-sm text-muted-foreground">Pick a role to start your AI interview practice session immediately</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleRoles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                onClick={() => navigate("/upload")}
                className="group relative cursor-pointer rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                    {role.badge}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-indigo-400 transition-colors">
                  {role.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">5 tailored technical & behavioral questions</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">PyMuPDF Resume Parsing</h3>
          <p className="text-sm text-muted-foreground">
            Automatically extracts your skills, work experience, and tech stack from PDF resumes to generate custom questions.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Gemini AI Voice Interviewer</h3>
          <p className="text-sm text-muted-foreground">
            Interactive AI interviewer that asks follow-ups, listens to your answers, and speaks aloud using speech synthesis.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Multi-Metric Scorecard</h3>
          <p className="text-sm text-muted-foreground">
            Get instant feedback breakdown across Technical Knowledge, Communication, Problem Solving, and Confidence.
          </p>
        </div>
      </section>
    </div>
  );
}

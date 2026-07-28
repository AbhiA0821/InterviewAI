/**
 * LandingPage.tsx
 * ------------------
 * Mocklingo.com-style landing page with hero banner, live interviewer video demo card,
 * feature highlights, supported domain showcase, candidate testimonials, and practice CTAs.
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Bot,
  Briefcase,
  CheckCircle2,
  Code2,
  Cpu,
  FileText,
  HardHat,
  Mic,
  Sparkles,
  Star,
  Video,
  Wrench,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Bot,
      title: "Realistic AI Avatars",
      description: "Practice with lifelike male and female AI interviewers featuring natural eye blinks, facial micro-expressions, and real-time lip-sync.",
      color: "from-emerald-500 to-teal-400",
    },
    {
      icon: FileText,
      title: "Resume-Driven Deep Intelligence",
      description: "Upload your PDF resume. Groq AI automatically extracts your exact skills, projects, certifications, and infers your target domain.",
      color: "from-cyan-500 to-blue-400",
    },
    {
      icon: Mic,
      title: "Voice-to-Voice Conversation",
      description: "Speak naturally using your microphone. Faster-Whisper converts your speech to text, Groq evaluates, and Edge TTS speaks back.",
      color: "from-indigo-500 to-violet-400",
    },
    {
      icon: Award,
      title: "Analytical Scorecards & Feedback",
      description: "Receive instant performance metrics on Technical Knowledge, HR & Cultural Fit, Communication Clarity, and Confidence.",
      color: "from-amber-500 to-orange-400",
    },
  ];

  const domains = [
    { name: "Software Engineering", icon: Code2, count: "5,400+ Questions" },
    { name: "AI & Machine Learning", icon: Cpu, count: "3,800+ Questions" },
    { name: "Mechanical Engineering", icon: Wrench, count: "2,900+ Questions" },
    { name: "Civil Engineering", icon: HardHat, count: "2,200+ Questions" },
    { name: "Electrical & Electronics", icon: Zap, count: "3,100+ Questions" },
    { name: "MBA & Product Management", icon: Briefcase, count: "4,600+ Questions" },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Development Engineer @ Tech Corp",
      quote: "Interviewing with Rohan helped me practice full-length technical rounds with live voice feedback. The resume-driven questions were identical to my real interview!",
      rating: 5,
    },
    {
      name: "Rahul Verma",
      role: "Mechanical Design Engineer",
      quote: "The realistic interviewer avatar and immediate scorecard breakdown boosted my confidence immensely. Highly recommended for engineering candidates!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-4 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Next-Gen Interview with Abhi AI Stage</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                Master Your Next Job Interview with{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Realistic AI Interviewers
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Practice realistic 1-on-1 voice interviews tailored to your exact resume, projects, and target role. Experience lifelike avatars, natural speech conversation, and instant analytical feedback.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/upload"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40"
                >
                  <Mic className="h-5 w-5" />
                  <span>Start Free AI Practice</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-4 text-base font-extrabold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <span>Explore Dashboard</span>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Resume-Driven
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Powered by Groq & Simli AI
                </span>
              </div>
            </div>

            {/* Right Card: Live Interviewer Avatar Demo Stage */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-4 shadow-2xl backdrop-blur">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                  <img
                    src="/avatars/riya_avatar.png"
                    alt="Riya AI Interviewer"
                    className="w-full h-full object-cover object-[center_16%] transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80";
                    }}
                  />

                  {/* Glass Header Tag */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-full px-3 py-1 flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI Interviewer (Riya) • Live</span>
                  </div>

                  {/* Waves sound badge */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-slate-200">"Walk me through your key experience..."</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-4 w-1 bg-emerald-400 rounded-full animate-bounce" />
                      <span className="h-6 w-1 bg-emerald-400 rounded-full animate-bounce delay-75" />
                      <span className="h-3 w-1 bg-emerald-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between px-2 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-teal-400" /> HD Photorealistic Avatar
                  </span>
                  <span className="text-emerald-400 font-mono">0.4s AI Latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="py-20 bg-slate-900/50 border-b border-slate-800/60">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Core Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Designed for Realistic Corporate Interviews
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Everything you need to practice, refine your technical answers, and land your dream job offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all duration-300 hover:border-slate-700 hover:-translate-y-1"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${feat.color} text-white mb-5 shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUPPORTED DOMAINS SHOWCASE */}
      <section className="py-20 border-b border-slate-800/60">
        <div className="container mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Engineering & Management</span>
              <h2 className="text-3xl font-black text-white tracking-tight">Specialized Interview Domains</h2>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <span>View All 20+ Domains</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((dom) => {
              const Icon = dom.icon;
              return (
                <Link
                  key={dom.name}
                  to={`/upload?role=${encodeURIComponent(dom.name)}`}
                  className="group flex items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-emerald-500/50 hover:bg-slate-900 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{dom.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{dom.count}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-slate-900/30 border-b border-slate-800/60">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Success Stories</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Loved by Candidates Worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 space-y-4 shadow-xl">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 font-medium italic leading-relaxed">"{t.quote}"</p>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-emerald-400 font-semibold">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center space-y-6 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Crack Your Next AI Mock Interview?
          </h2>
          <p className="text-sm text-slate-300 font-medium max-w-xl mx-auto">
            Upload your resume, select your target role, and experience a realistic 1-on-1 voice interview with instant feedback.
          </p>
          <div>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Mic className="h-5 w-5" />
              <span>Start Practice Interview Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

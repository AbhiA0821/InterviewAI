/**
 * LandingPage.tsx
 * ------------------
 * Mocklingo-style landing page with hero banner, live interviewer video demo card,
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
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

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
      title: "Resume-Driven Intelligence",
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
      title: "Analytical Scorecard & Metrics",
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
      quote: "Interviewing with Riya helped me practice full-length technical rounds with live voice feedback. The resume-driven questions were identical to my real interview!",
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
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-4 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur shadow-sm">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Next-Gen Voice AI Interview Suite</span>
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
                <Link to="/upload" className="w-full sm:w-auto">
                  <Button
                    variant="emerald"
                    size="lg"
                    className="w-full sm:w-auto font-black shadow-emerald-500/30"
                    leftIcon={<Mic className="h-5 w-5" />}
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Start Free AI Practice
                  </Button>
                </Link>

                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto font-bold">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>

              {/* Live Platform Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-white">98.4%</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Success Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">15,000+</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Mock Interviews</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-cyan-400 font-mono">&lt; 0.5s</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">AI Response Latency</p>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-2 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Resume-Driven
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Groq & Simli AI Engine
                </span>
              </div>
            </div>

            {/* Right Card: Live Interviewer Avatar Demo Stage */}
            <div className="lg:col-span-5 relative">
              <Card variant="glass-hover" glow="emerald" className="p-4 relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                  <img
                    src="/avatars/robot_avatar.png"
                    alt="AI Robot Interviewer"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Glass Header Tag */}
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-700/60 rounded-full px-3 py-1 flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI Interviewer (Riya) • Live</span>
                  </div>

                  {/* Audio visualizer floating footer */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs shadow-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-slate-200 truncate">
                        "Walk me through your key experience..."
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="h-4 w-1 bg-emerald-400 rounded-full animate-bounce" />
                      <span className="h-6 w-1 bg-emerald-400 rounded-full animate-bounce delay-75" />
                      <span className="h-3 w-1 bg-emerald-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between px-2 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-teal-400" /> Photorealistic Avatar
                  </span>
                  <Badge variant="emerald" dot>
                    Active Voice Stream
                  </Badge>
                </div>
              </Card>
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
                <Card
                  key={feat.title}
                  variant="glass-hover"
                  className="p-6 transition-all duration-300"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${feat.color} text-white mb-5 shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {feat.description}
                  </p>
                </Card>
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
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
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
                >
                  <Card
                    variant="glass-hover"
                    className="p-5 flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {dom.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">{dom.count}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </Card>
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
              <Card key={idx} variant="glass" className="p-8 space-y-4 shadow-xl">
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
              </Card>
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
          <div className="pt-2">
            <Link to="/upload">
              <Button
                variant="emerald"
                size="lg"
                className="font-black px-10 shadow-emerald-500/30"
                leftIcon={<Mic className="h-5 w-5" />}
              >
                Start Practice Interview Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ParsedResume, resumeService } from "../services/resumeService";
import { interviewService } from "../services/interviewService";
import { ArrowRight, Briefcase, Building2, CheckCircle2, Cpu, FileText, HardHat, Lightbulb, Loader2, Sparkles, Upload, UserCheck, Wrench } from "lucide-react";

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [targetRole, setTargetRole] = useState("Computer Science - Software Engineer");
  const [interviewType, setInterviewType] = useState<"technical" | "hr" | "non_technical">("technical");
  const [interviewerGender, setInterviewerGender] = useState<"female" | "male">("female");
  const [error, setError] = useState("");

  const engineeringBranches = [
    { title: "Computer Science - Software Engineer", icon: Cpu, branch: "CSE / IT" },
    { title: "AI / Machine Learning Engineer", icon: Sparkles, branch: "AI & DS" },
    { title: "Mechanical Engineering", icon: Wrench, branch: "Mech" },
    { title: "Electrical & Electronics (ECE / EEE)", icon: Cpu, branch: "ECE / EEE" },
    { title: "Civil & Structural Engineering", icon: HardHat, branch: "Civil" },
    { title: "Chemical & Process Engineering", icon: Building2, branch: "Chemical" },
    { title: "Data Analyst & Business Intelligence", icon: Lightbulb, branch: "Analytics" },
    { title: "Product Manager & Technical Lead", icon: Briefcase, branch: "Management" },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError("");
      setUploading(true);

      try {
        const result = await resumeService.uploadResume(selectedFile);
        setParsedResume(result);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to parse resume.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleStartInterview = async () => {
    if (!targetRole.trim()) {
      setError("Please select or enter an engineering branch/role.");
      return;
    }
    setStarting(true);
    setError("");
    try {
      localStorage.setItem("selected_gender", interviewerGender);
      const res = await interviewService.startInterview(
        targetRole,
        parsedResume ? parsedResume.id : undefined,
        interviewType
      );
      navigate(`/interview/${res.interview_id}?gender=${interviewerGender}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to start interview session.");
    } finally {
      setStarting(false);
    }
  };

  const extractedSkills = parsedResume?.parsed_json?.skills || [
    "Software Engineering",
    "Python / TypeScript",
    "Problem Solving",
    "System Design",
    "Git & Version Control",
  ];


  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Setup Your AI Practice Session
        </h1>
        <p className="text-muted-foreground">
          Select AI Interviewer Avatar, choose your Engineering Branch, and upload a resume for automatic skills extraction.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive font-medium text-center">
          {error}
        </div>
      )}

      {/* Step 1: Select AI Interviewer Avatar FIRST */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-card to-violet-950/40 p-6 md:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-indigo-400" />
          <span>Step 1: Choose Your AI Interviewer Avatar</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Your selected avatar will greet you and conduct the voice interview with an Indian English accent.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Female Avatar Option */}
          <div
            onClick={() => setInterviewerGender("female")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all text-center space-y-3 ${
              interviewerGender === "female"
                ? "border-indigo-500 bg-indigo-500/20 shadow-xl ring-2 ring-indigo-500/60"
                : "border-border/60 bg-muted/20 hover:bg-accent"
            }`}
          >
            <div className="relative h-28 w-28 mx-auto rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-md">
              <img src="/avatars/female.png" alt="Priya Avatar" className="h-full w-full object-cover object-top" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Priya (Female Voice)</h3>
              <p className="text-xs text-indigo-300 font-medium">Senior AI Tech Lead • Indian Accent</p>
            </div>
          </div>

          {/* Male Avatar Option */}
          <div
            onClick={() => setInterviewerGender("male")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all text-center space-y-3 ${
              interviewerGender === "male"
                ? "border-indigo-500 bg-indigo-500/20 shadow-xl ring-2 ring-indigo-500/60"
                : "border-border/60 bg-muted/20 hover:bg-accent"
            }`}
          >
            <div className="relative h-28 w-28 mx-auto rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-md">
              <img src="/avatars/male.png" alt="Rohan Avatar" className="h-full w-full object-cover object-top" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Rohan (Male Voice)</h3>
              <p className="text-xs text-indigo-300 font-medium">Principal AI Engineer • Indian Accent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Select Interview Mode */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Step 2: Select Interview Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setInterviewType("technical")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              interviewType === "technical"
                ? "border-indigo-500 bg-indigo-500/20 shadow-md ring-2 ring-indigo-500/50"
                : "border-border/60 bg-muted/20 hover:bg-accent"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-foreground mb-1">
              <Cpu className="h-5 w-5 text-indigo-400" />
              <span>Technical Interview</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Core branch fundamentals, domain engineering concepts, system design, and practical problem solving.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setInterviewType("hr")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              interviewType === "hr"
                ? "border-violet-500 bg-violet-500/20 shadow-md ring-2 ring-violet-500/50"
                : "border-border/60 bg-muted/20 hover:bg-accent"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-foreground mb-1">
              <Briefcase className="h-5 w-5 text-violet-400" />
              <span>HR & Behavioral</span>
            </div>
            <p className="text-xs text-muted-foreground">
              HR questions, cultural fit, workplace conflict resolution, motivation, salary expectation & career goals.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setInterviewType("non_technical")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              interviewType === "non_technical"
                ? "border-purple-500 bg-purple-500/20 shadow-md ring-2 ring-purple-500/50"
                : "border-border/60 bg-muted/20 hover:bg-accent"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-foreground mb-1">
              <Lightbulb className="h-5 w-5 text-purple-400" />
              <span>Non-Technical & Aptitude</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Analytical reasoning, decision making under pressure, project management, and team communication.
            </p>
          </button>
        </div>
      </div>

      {/* Step 3: Target Engineering Branch Selector */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Step 3: Select Engineering Branch / Role</h2>
            <p className="text-xs text-muted-foreground">Covers all major engineering domains</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Engineering Specialization / Job Title
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Mechanical Engineer or ECE Core Specialist"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-muted-foreground mb-2">
              Preset Engineering Branches:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {engineeringBranches.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setTargetRole(item.title)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    targetRole === item.title
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-sm"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span className="block font-bold">{item.branch}</span>
                  <span className="text-[11px] opacity-80 font-normal block truncate mt-0.5">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instant Automatic Resume Upload & Extracted Skills Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upload PDF Resume (Auto-Extracted Skills)</h2>
            <p className="text-xs text-muted-foreground">Automatically parses skills from your PDF resume instantly</p>
          </div>
        </div>

        {!parsedResume ? (
          <div className="space-y-4">
            <div className="relative border-2 border-dashed border-indigo-500/40 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-indigo-500/5">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    <p className="font-semibold text-indigo-300 text-sm">
                      Automatically Parsing PDF Resume Skills...
                    </p>
                  </>
                ) : (
                  <>
                    <FileText className="h-8 w-8 text-indigo-400" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {file ? file.name : "Drop or click to upload PDF resume"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Skills will be automatically extracted into your practice session
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Resume Auto-Parsed: {parsedResume.original_filename}</span>
              </div>
              <button
                onClick={() => {
                  setParsedResume(null);
                  setFile(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Change Resume
              </button>
            </div>

            {/* Extracted Candidate Skills Display */}
            <div>
              <span className="block text-xs font-semibold text-muted-foreground mb-2">
                Auto-Extracted Candidate Skills & Experience:
              </span>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200"
                  >
                    ✨ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Start Interview CTA */}
      <div>
        <button
          onClick={handleStartInterview}
          disabled={starting}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] hover:shadow-indigo-600/40 disabled:opacity-50"
        >
          {starting ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Starting Session with {interviewerGender === "female" ? "Priya" : "Rohan"}...</span>
            </>
          ) : (
            <>
              <span>Start Voice Practice with {interviewerGender === "female" ? "Priya" : "Rohan"}</span>
              <ArrowRight className="h-6 w-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

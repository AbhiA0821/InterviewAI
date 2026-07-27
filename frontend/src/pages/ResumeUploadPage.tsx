import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ParsedResume, resumeService } from "../services/resumeService";
import { interviewService } from "../services/interviewService";
import { ArrowRight, Briefcase, Building2, CheckCircle2, Cpu, FileText, HardHat, Lightbulb, Loader2, Sparkles, Upload, Wrench } from "lucide-react";

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [targetRole, setTargetRole] = useState("Computer Science - Software Engineer");
  const [interviewType, setInterviewType] = useState<"technical" | "hr" | "non_technical">("technical");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF resume file first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result = await resumeService.uploadResume(file);
      setParsedResume(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to upload and parse resume.");
    } finally {
      setUploading(false);
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
      const res = await interviewService.startInterview(
        targetRole,
        parsedResume ? parsedResume.id : undefined,
        interviewType
      );
      navigate(`/interview/${res.interview_id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to start interview session.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Setup Your AI Practice Interview
        </h1>
        <p className="text-muted-foreground">
          Choose your Engineering Branch, select Interview Type (HR / Technical / Non-Technical), and optionally upload a resume.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive font-medium text-center">
          {error}
        </div>
      )}

      {/* Interview Mode Selector: HR vs Technical vs Non-Technical */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-card to-violet-950/30 p-6 md:p-8 space-y-4 shadow-lg">
        <h2 className="text-lg font-bold text-foreground">Select Interview Type</h2>
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

      {/* Target Engineering Branch Selector */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Select Engineering Branch / Role</h2>
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

      {/* Resume Upload Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upload PDF Resume (Optional)</h2>
            <p className="text-xs text-muted-foreground">Personalizes questions based on your actual experience</p>
          </div>
        </div>

        {!parsedResume ? (
          <div className="space-y-4">
            <div className="relative border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-colors bg-muted/20">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <FileText className="h-8 w-8 text-indigo-400" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {file ? file.name : "Click or drag PDF resume here"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-muted border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Parsing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Parse Uploaded PDF</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Resume Parsed: {parsedResume.original_filename}</span>
            </div>
            <button
              onClick={() => setParsedResume(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Remove
            </button>
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
              <span>Generating AI {interviewType.toUpperCase()} Interview Questions...</span>
            </>
          ) : (
            <>
              <span>Start {interviewType.toUpperCase()} Practice Session</span>
              <ArrowRight className="h-6 w-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

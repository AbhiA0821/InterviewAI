import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ParsedResume, resumeService } from "../services/resumeService";
import { interviewService } from "../services/interviewService";
import { ArrowRight, CheckCircle2, FileText, Loader2, Sparkles, Upload } from "lucide-react";

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [targetRole, setTargetRole] = useState("Fullstack Software Engineer");
  const [error, setError] = useState("");

  const presetRoles = [
    "Fullstack Software Engineer",
    "Backend Developer",
    "Frontend Developer",
    "AI / Machine Learning Engineer",
    "Data Scientist",
    "DevOps / Cloud Engineer",
    "Product Manager",
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
      setError("Please enter or select a target job role.");
      return;
    }
    setStarting(true);
    setError("");
    try {
      const res = await interviewService.startInterview(
        targetRole,
        parsedResume ? parsedResume.id : undefined
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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Step 1: Upload Resume & Select Role
        </h1>
        <p className="text-muted-foreground">
          Upload your PDF resume so Gemini AI can extract your experience and customize your interview questions.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive font-medium text-center">
          {error}
        </div>
      )}

      {/* File Upload Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upload PDF Resume</h2>
            <p className="text-xs text-muted-foreground">Supports .pdf documents</p>
          </div>
        </div>

        {!parsedResume ? (
          <div className="space-y-4">
            <div className="relative border-2 border-dashed border-border/80 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-colors bg-muted/20">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {file ? file.name : "Click or drag PDF resume here to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Maximum file size: 10MB</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Parsing Resume with PyMuPDF...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Parse Resume</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Resume Successfully Parsed</span>
              </div>
              <button
                onClick={() => {
                  setParsedResume(null);
                  setFile(null);
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground underline"
              >
                Change File
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong className="text-foreground">Candidate:</strong>{" "}
                <span className="text-muted-foreground">
                  {parsedResume.parsed_json.candidate_name || "Extracted Candidate"}
                </span>
              </p>

              {parsedResume.parsed_json.skills && parsedResume.parsed_json.skills.length > 0 && (
                <div>
                  <strong className="text-foreground block mb-2">Detected Technical Skills:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResume.parsed_json.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-indigo-500/15 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Target Role Selector */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Target Role Selection</h2>
            <p className="text-xs text-muted-foreground">Select or type the role you want to interview for</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Target Job Title
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Fullstack Engineer"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-muted-foreground mb-2">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-2">
              {presetRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    targetRole === role
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          onClick={handleStartInterview}
          disabled={starting}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] hover:shadow-indigo-600/40 disabled:opacity-50"
        >
          {starting ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Generating Tailored Interview Questions...</span>
            </>
          ) : (
            <>
              <span>Start AI Practice Session</span>
              <ArrowRight className="h-6 w-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ParsedResume, resumeService } from "../services/resumeService";
import { interviewService } from "../services/interviewService";
import { CheckCircle2, Info, Loader2, Sparkles, Upload, Volume2, Wifi, X, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") || "Full Stack Software Engineer";

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  const [experienceLevel, setExperienceLevel] = useState<"Fresher" | "Intermediate" | "Experienced">("Fresher");
  const [interviewerGender, setInterviewerGender] = useState<"tanya" | "riya" | "rohan" | "abhi">("riya");
  const [targetRole, setTargetRole] = useState(roleParam);
  const [duration, setDuration] = useState("5 mins");
  const typeParam = (searchParams.get("type") as "technical" | "hr" | "non_technical") || "technical";
  const [interviewType, setInterviewType] = useState<"technical" | "hr" | "non_technical">(typeParam);
  const [agreed, setAgreed] = useState(true);
  const [step, setStep] = useState<"setup" | "precheck">("setup");
  const [error, setError] = useState("");

  const engineeringBranches = [
    "Computer Science - Software Engineer",
    "AI / Machine Learning Engineer",
    "Mechanical Engineering",
    "Electrical & Electronics (ECE / EEE)",
    "Civil & Structural Engineering",
    "Chemical & Process Engineering",
    "Data Analyst & Business Intelligence",
    "Product Manager & Technical Lead",
  ];

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-start camera on precheck step
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === "precheck") {
      async function startPrecheckCamera() {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: 640, height: 480, facingMode: "user" },
              audio: false,
            });
            if (liveVideoRef.current) {
              liveVideoRef.current.srcObject = stream;
            }
          }
        } catch (e) {
          console.warn("Precheck camera unavailable:", e);
        }
      }
      startPrecheckCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [step]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError("");
      setUploading(true);

      try {
        const result = await resumeService.uploadResume(selectedFile);
        setParsedResume(result);

        if (result.parsed_json) {
          const detectedRole =
            result.parsed_json.domain ||
            result.parsed_json.job_title ||
            result.parsed_json.recommended_role;
          if (detectedRole && (!targetRole || targetRole === "Full Stack Software Engineer")) {
            setTargetRole(detectedRole);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to parse resume.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleProceedToPrecheck = () => {
    if (!targetRole.trim()) {
      setError("Please specify a job role or domain.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms and Conditions to proceed.");
      return;
    }
    setError("");
    setStep("precheck");
  };

  const handleLaunchInterview = async () => {
    setStarting(true);
    setError("");
    try {
      const genderParam = interviewerGender === "abhi" ? "male" : "female";
      localStorage.setItem("selected_gender", genderParam);
      localStorage.setItem("selected_duration", duration);
      const res = await interviewService.startInterview(
        targetRole,
        parsedResume ? parsedResume.id : undefined,
        interviewType
      );
      navigate(`/mirror_room/${res.interview_id}?gender=${genderParam}&duration=${encodeURIComponent(duration)}`);
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
    "System Architecture",
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 text-white px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Badge variant="emerald" dot>
            Setup Phase
          </Badge>
          <h1 className="text-lg font-bold tracking-wide">
            {step === "setup" ? "Interview Configuration" : "Pre-Call Diagnostics"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs text-rose-300 font-bold text-center">
          {error}
        </div>
      )}

      {/* STEP 1: INTERVIEW DETAILS SETUP MODAL */}
      {step === "setup" && (
        <Card variant="glass" className="p-0 overflow-hidden grid grid-cols-1 md:grid-cols-12 text-slate-100 border-slate-800">
          {/* Left Panel */}
          <div className="md:col-span-5 bg-gradient-to-b from-emerald-950/60 via-slate-900 to-slate-950 p-8 flex flex-col justify-between items-center text-center relative overflow-hidden border-r border-slate-800">
            <div className="space-y-6 z-10 my-auto">
              <Badge variant="emerald" dot className="px-3 py-1">
                AI Interview Partner
              </Badge>
              <h2 className="text-2xl font-black text-white">InterviewAI Studio</h2>

              <div className="space-y-3 text-slate-300 text-xs font-semibold">
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited Mock Interviews
                </p>
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Photorealistic AI Avatars
                </p>
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant Multi-Metric Feedback
                </p>
              </div>

              <div className="pt-8">
                <span className="text-sm font-black tracking-wider text-slate-400 block uppercase">Powered by</span>
                <span className="text-base font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Groq & Simli WebRTC Engine
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Setup Form */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6 bg-slate-950/80">
            {/* Interactive Interview Round Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Select Interview Round Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInterviewType("technical")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                    interviewType === "technical"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  🛠️ Core Technical
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewType("hr")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                    interviewType === "hr"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  👥 HR & Behavioral
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewType("non_technical")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                    interviewType === "non_technical"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  🧠 Analytical Round
                </button>
              </div>
            </div>

            {/* Experience Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <span>Experience Level *</span>
                <Info className="h-3.5 w-3.5 text-slate-500" />
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Fresher", "Intermediate", "Experienced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      experienceLevel === lvl
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Interviewer Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Select Interviewer Avatar *</label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewerGender("riya")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    interviewerGender === "riya"
                      ? "border-2 border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-sm"
                      : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <img src="/avatars/female.png" alt="Riya" className="h-6 w-6 rounded-full object-cover border border-emerald-400/40" />
                  <span>Riya (Tech Lead)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewerGender("abhi")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    interviewerGender === "abhi"
                      ? "border-2 border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-sm"
                      : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <img src="/avatars/male.png" alt="Abhi" className="h-6 w-6 rounded-full object-cover border border-emerald-400/40" />
                  <span>Abhi (Engineering Mgr)</span>
                </button>
              </div>
            </div>

            {/* Target Role Dropdown & Duration Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Target Engineering Domain *</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {engineeringBranches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Interview Duration *</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="5 mins">5 mins (Standard Round)</option>
                  <option value="10 mins">10 mins (Extended Round)</option>
                  <option value="15 mins">15 mins (Full Architectural Round)</option>
                </select>
              </div>
            </div>

            {/* PDF Resume Parser */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-emerald-400" />
                  <span>Upload Resume PDF (Skill Extraction)</span>
                </span>
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />}
              </div>

              {!parsedResume ? (
                <div className="relative border border-dashed border-slate-700/80 hover:border-emerald-500/70 rounded-xl p-4 text-center bg-slate-950/60 transition-colors">
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Parsing {file?.name}...</span>
                      </>
                    ) : file ? (
                      <span className="text-amber-400 font-bold">Extracting skills from {file.name}...</span>
                    ) : (
                      "Click or drag PDF resume here"
                    )}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Skills Extracted from {file?.name || "Resume"}:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {extractedSkills.map((sk, i) => (
                      <Badge key={i} variant="emerald" className="text-[11px]">
                        ✨ {sk}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  I agree with the <span className="font-bold text-emerald-400 underline">Terms and Conditions</span>
                </span>
              </label>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                Cancel
              </Button>

              <Button
                variant="emerald"
                size="md"
                onClick={handleProceedToPrecheck}
                isLoading={uploading || (file !== null && !parsedResume)}
                disabled={uploading || (file !== null && !parsedResume) || !agreed || !targetRole.trim()}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Proceed to Pre-check
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: PRE-CALL CHECK SCREEN */}
      {step === "precheck" && (
        <Card variant="glass" className="p-6 sm:p-8 space-y-6 text-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Camera Preview */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                <video ref={liveVideoRef} autoPlay playsInline muted className="h-full w-full object-cover transform -scale-x-100" />
                <div className="absolute top-3 left-3">
                  <Badge variant="emerald" dot>
                    LIVE PREVIEW
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Camera Connected</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Microphone Connected</span>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Details */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Interview Round Type</label>
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs font-black text-emerald-300">
                  {interviewType === "technical"
                    ? "🛠️ Core Technical Round"
                    : interviewType === "hr"
                    ? "👥 HR & Behavioral Round"
                    : "🧠 Analytical Round"}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Domain</label>
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200">
                  {targetRole}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Topics</label>
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 truncate">
                  {extractedSkills.join(", ")}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Experience & Duration</label>
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200">
                  {experienceLevel} • {duration}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Checklist Banner */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-4 flex items-center gap-2 text-emerald-400 font-extrabold text-xs tracking-wider uppercase">
              <Sparkles className="h-4 w-4" />
              <span>BEFORE YOU BEGIN</span>
            </div>

            <div className="sm:col-span-4 rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">Find a quiet spot</div>
                <div className="text-[10px] text-slate-400">Minimal background noise</div>
              </div>
            </div>

            <div className="sm:col-span-4 rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center gap-3">
              <Wifi className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">Check internet</div>
                <div className="text-[10px] text-slate-400">Stable connection ready</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="md" onClick={() => setStep("setup")}>
              Go Back
            </Button>

            <Button
              variant="emerald"
              size="md"
              onClick={handleLaunchInterview}
              isLoading={starting}
              title="Launch AI Live Interview call"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start Interview Call
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}


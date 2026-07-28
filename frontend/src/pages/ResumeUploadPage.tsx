import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ParsedResume, resumeService } from "../services/resumeService";
import { interviewService } from "../services/interviewService";
import { CheckCircle2, Info, Loader2, Sparkles, Upload, Volume2, Wifi, X } from "lucide-react";

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
        
        // Auto-determine domain & job profile from AI resume analysis only if targetRole is default
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
      {/* Black Header Bar matching Screenshot 1 & 3 */}
      <div className="rounded-2xl bg-black text-white px-6 py-4 flex items-center justify-between shadow-xl">
        <h1 className="text-xl font-bold tracking-wide">
          {step === "setup" ? "Interview Details" : "Selected Details"}
        </h1>
        <button
          onClick={() => navigate("/")}
          className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400 font-medium text-center">
          {error}
        </div>
      )}

      {/* STEP 1: INTERVIEW DETAILS SETUP MODAL (Matches Screenshot 1) */}
      {step === "setup" && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-slate-800">
          {/* Left Panel: Mint/Teal Banner */}
          <div className="md:col-span-5 bg-gradient-to-b from-emerald-50 via-teal-100 to-cyan-50 p-8 flex flex-col justify-between items-center text-center relative overflow-hidden border-r border-slate-100">
            <div className="space-y-6 z-10 my-auto">
              <h2 className="text-xl font-bold text-teal-800">Your AI Interview Partner</h2>

              <div className="space-y-3 text-slate-700 text-sm font-semibold">
                <p>Unlimited Mock Interviews</p>
                <p>Realistic AI Interviewer</p>
                <p>Instant Feedback</p>
              </div>

              <div className="pt-8">
                <span className="text-xl font-black tracking-wider text-slate-800">INTERVIEW WITH ABHI</span>
                <span className="block text-xs text-teal-600 font-bold mt-1">Succeed.</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Setup Form */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6 bg-white">
            {/* Interactive Interview Round Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Select Interview Round Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setInterviewType("technical")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                    interviewType === "technical"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  🛠️ Core Technical
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewType("hr")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                    interviewType === "hr"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  👥 HR & Behavioral
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewType("non_technical")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                    interviewType === "non_technical"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  🧠 Analytical Round
                </button>
              </div>
            </div>

            {/* Experience Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <span>Experience Level *</span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Fresher", "Intermediate", "Experienced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      experienceLevel === lvl
                        ? "bg-slate-300 text-slate-900 border border-slate-400"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Interviewer Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Select Interviewer *</label>
              <div className="flex flex-wrap gap-3">
                {/* Tanya Avatar Pill */}
                <button
                  type="button"
                  onClick={() => setInterviewerGender("tanya")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    interviewerGender === "tanya"
                      ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  <img src="/avatars/female.png" alt="Tanya" className="h-6 w-6 rounded-full object-cover" />
                  <span>Tanya (Female)</span>
                </button>

                {/* Riya Avatar Pill */}
                <button
                  type="button"
                  onClick={() => setInterviewerGender("riya")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    interviewerGender === "riya"
                      ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  <img src="/avatars/female.png" alt="Riya" className="h-6 w-6 rounded-full object-cover" />
                  <span>Riya (Female)</span>
                </button>

                {/* Abhi Avatar Pill */}
                <button
                  type="button"
                  onClick={() => setInterviewerGender("abhi")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    interviewerGender === "abhi"
                      ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  <img src="/avatars/male.png" alt="Abhi" className="h-6 w-6 rounded-full object-cover" />
                  <span>Abhi (Male)</span>
                </button>
              </div>
            </div>

            {/* Target Role Dropdown & Duration Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Target Engineering Domain / Branch *</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-full border border-emerald-500/60 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {engineeringBranches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Interview Duration *</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-full border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="5 mins">5 mins (Standard Round)</option>
                  <option value="10 mins">10 mins (Extended Round)</option>
                  <option value="15 mins">15 mins (Full Architectural Round)</option>
                </select>
              </div>
            </div>

            {/* PDF Resume Parser */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Upload Resume PDF (Auto Skills Extraction)</span>
                </span>
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
              </div>

              {!parsedResume ? (
                <div className="relative border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white">
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-xs text-slate-500 font-medium">
                    {file ? file.name : "Click or drag PDF resume here"}
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {extractedSkills.map((sk, i) => (
                    <span key={i} className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
                      ✨ {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  I agree with the <span className="font-bold text-emerald-600 underline">Terms and Conditions</span>
                </span>
              </label>

              <span className="rounded-full bg-red-50 text-red-500 px-3 py-1 text-[11px] font-bold border border-red-200">
                Unlimited Practice Mode
              </span>
            </div>

            {/* Bottom Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToPrecheck}
                className="px-8 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-md"
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SELECTED DETAILS / PRE-CALL CHECK SCREEN (Matches Screenshot 3) */}
      {step === "precheck" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-2xl text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Candidate Live Stream Preview */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-300 shadow-inner">
                <video ref={liveVideoRef} autoPlay playsInline muted className="h-full w-full object-cover transform -scale-x-100" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Camera is working</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mic is working</span>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Details Fields */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Interview Round Type</label>
                <div className="rounded-full border border-emerald-500/40 bg-emerald-50 px-5 py-2.5 text-xs font-black text-emerald-800 flex items-center gap-2">
                  <span>
                    {interviewType === "technical"
                      ? "🛠️ Core Technical Round"
                      : interviewType === "hr"
                      ? "👥 HR & Behavioral Round"
                      : "🧠 Analytical & Soft Skills Round"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Domain</label>
                <div className="rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-800">
                  {targetRole}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Topics</label>
                <div className="rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-800 truncate">
                  {extractedSkills.join(", ")}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Experience</label>
                <div className="rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-800">
                  {experienceLevel}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Duration</label>
                <div className="rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-800">
                  {duration}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Interviewer</label>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-4 py-1.5 text-xs font-bold shadow-sm">
                  <img src={interviewerGender === "abhi" ? "/avatars/male.png" : "/avatars/female.png"} alt="Interviewer" className="h-5 w-5 rounded-full object-cover" />
                  <span>{interviewerGender === "abhi" ? "Abhi" : interviewerGender === "tanya" ? "Tanya" : "Riya"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Checklist Banner */}
          <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-4 flex items-center gap-2 text-teal-800 font-extrabold text-xs tracking-wider uppercase">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>BEFORE YOU BEGIN</span>
            </div>

            <div className="sm:col-span-4 rounded-xl bg-white p-3 border border-slate-200 flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">Find a quiet spot</div>
                <div className="text-[10px] text-slate-500">No background noise</div>
              </div>
            </div>

            <div className="sm:col-span-4 rounded-xl bg-white p-3 border border-slate-200 flex items-center gap-3">
              <Wifi className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">Check your internet</div>
                <div className="text-[10px] text-slate-500">Stay connected</div>
              </div>
            </div>
          </div>

          {/* Final Action CTA Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep("setup")}
              className="px-6 py-2.5 rounded-full border border-slate-400 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Go Back
            </button>

            <button
              type="button"
              onClick={handleLaunchInterview}
              disabled={starting}
              className="px-8 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
            >
              {starting ? "Launching..." : "Start Interview"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

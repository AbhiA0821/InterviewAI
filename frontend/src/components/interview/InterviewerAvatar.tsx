import React, { useEffect, useState } from "react";
import { Mic, Sparkles, UserCheck, Volume2 } from "lucide-react";

export interface InterviewerAvatarProps {
  gender: "female" | "male";
  onGenderChange: (gender: "female" | "male") => void;
  status: "speaking" | "listening" | "thinking" | "idle";
  interviewerName: string;
  speakingBoundaryTick?: number;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  gender,
  onGenderChange,
  status,
  interviewerName,
  speakingBoundaryTick = 0,
}) => {
  const [speechPulse, setSpeechPulse] = useState(1);
  const avatarImage = gender === "female" ? "/avatars/female.png" : "/avatars/male.png";

  // Micro-motion speech pulse effect (realistic face/jaw micro-movement on speech boundaries)
  useEffect(() => {
    if (status === "speaking") {
      const pulse = 1.0 + Math.random() * 0.04;
      setSpeechPulse(pulse);

      const timer = setTimeout(() => {
        setSpeechPulse(1.0);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setSpeechPulse(1.0);
    }
  }, [status, speakingBoundaryTick]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 via-card to-card p-6 text-center shadow-xl space-y-4">
      {/* Background Ambient Glow */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full blur-3xl transition-all duration-700 ${
          status === "speaking"
            ? "bg-indigo-500/40 scale-125"
            : status === "listening"
            ? "bg-purple-500/30 scale-110"
            : "bg-indigo-500/15"
        }`}
      />

      {/* Avatar Container with Realistic Speech Micro-Motion & Glowing Border */}
      <div className="relative inline-block mx-auto">
        <div
          className={`relative h-48 w-48 md:h-56 md:w-56 rounded-full p-1.5 transition-all duration-300 ${
            status === "speaking"
              ? "ring-4 ring-indigo-500 shadow-2xl shadow-indigo-500/70"
              : status === "listening"
              ? "ring-4 ring-purple-500 shadow-xl shadow-purple-500/50 animate-pulse"
              : "ring-2 ring-indigo-500/30"
          }`}
        >
          {/* Realistic Professional Avatar Image with Subtle Speech Motion */}
          <div className="h-full w-full rounded-full overflow-hidden shadow-inner">
            <img
              src={avatarImage}
              alt={`${interviewerName} AI Interviewer`}
              className="h-full w-full object-cover transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${speechPulse}) translateY(${
                  status === "speaking" ? (speechPulse - 1) * -8 : 0
                }px)`,
              }}
            />
          </div>

          {/* Real-time Audio Waveform Bar Indicator while Speaking */}
          {status === "speaking" && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-indigo-950/95 border border-indigo-500/60 px-4 py-1.5 text-white shadow-2xl text-xs font-bold backdrop-blur">
              <Volume2 className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span className="flex items-center gap-0.5 ml-0.5">
                <span
                  className="w-1 bg-indigo-400 rounded-full animate-bounce"
                  style={{ height: "10px", animationDelay: "0ms" }}
                />
                <span
                  className="w-1 bg-indigo-400 rounded-full animate-bounce"
                  style={{ height: "14px", animationDelay: "150ms" }}
                />
                <span
                  className="w-1 bg-indigo-400 rounded-full animate-bounce"
                  style={{ height: "8px", animationDelay: "300ms" }}
                />
              </span>
              <span className="ml-1 text-xs text-indigo-200">AI Speaking</span>
            </div>
          )}

          {/* Listening Badge */}
          {status === "listening" && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-purple-950/95 border border-purple-500/60 px-4 py-1.5 text-white shadow-2xl text-xs font-bold backdrop-blur">
              <Mic className="h-4 w-4 text-purple-400 animate-pulse" />
              <span>Listening to candidate...</span>
            </div>
          )}

          {/* Thinking Badge */}
          {status === "thinking" && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-indigo-950/95 border border-indigo-500/60 px-4 py-1.5 text-white shadow-2xl text-xs font-bold backdrop-blur">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
              <span>AI is evaluating response...</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Interviewer Credentials */}
      <div className="space-y-3 relative z-10 pt-2">
        <div>
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            {interviewerName}
          </h3>
          <p className="text-xs text-indigo-300 font-medium mt-0.5">
            Senior AI Interviewer • Indian English Accent
          </p>
        </div>

        {/* Male vs Female Voice Switcher */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onGenderChange("female")}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              gender === "female"
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-md"
                : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Priya (Female Voice)</span>
          </button>

          <button
            type="button"
            onClick={() => onGenderChange("male")}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              gender === "male"
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-md"
                : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Rohan (Male Voice)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Mic, Sparkles, Volume2 } from "lucide-react";


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

  // Micro-motion speech animation (subtle face/shoulder movement while speaking)
  useEffect(() => {
    if (status === "speaking") {
      setSpeechPulse(1.0 + Math.random() * 0.03);

      const timer = setTimeout(() => {
        setSpeechPulse(1.0);
      }, 110);

      return () => clearTimeout(timer);
    } else {
      setSpeechPulse(1.0);
    }
  }, [status, speakingBoundaryTick]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 via-card to-card p-6 shadow-2xl flex flex-col justify-between space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between z-10">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
          <span>{interviewerName}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onGenderChange("female")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              gender === "female"
                ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Priya (Female)
          </button>
          <button
            type="button"
            onClick={() => onGenderChange("male")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              gender === "male"
                ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rohan (Male)
          </button>
        </div>
      </div>

      {/* Full Widescreen 16:9 Realistic AI Video Frame (Matches Candidate Camera) */}
      <div className="relative h-56 md:h-64 w-full rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-indigo-500/30 shadow-inner">
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

        {/* Dynamic Status Badges over Video Feed */}
        {status === "speaking" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-indigo-950/90 border border-indigo-500/60 px-3.5 py-1 text-white shadow-xl text-xs font-bold backdrop-blur">
            <Volume2 className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span className="flex items-center gap-0.5">
              <span
                className="w-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ height: "8px", animationDelay: "0ms" }}
              />
              <span
                className="w-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ height: "12px", animationDelay: "150ms" }}
              />
              <span
                className="w-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ height: "6px", animationDelay: "300ms" }}
              />
            </span>
            <span className="text-[11px] text-indigo-200">AI Speaking</span>
          </div>
        )}

        {status === "listening" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-purple-950/90 border border-purple-500/60 px-3.5 py-1 text-white shadow-xl text-xs font-bold backdrop-blur">
            <Mic className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span className="text-[11px]">Listening...</span>
          </div>
        )}

        {status === "thinking" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-indigo-950/90 border border-indigo-500/60 px-3.5 py-1 text-white shadow-xl text-xs font-bold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
            <span className="text-[11px]">Evaluating...</span>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-muted-foreground font-medium pt-0.5">
        <span>Senior Professional AI Interviewer • Indian English Accent</span>
      </div>
    </div>
  );
};

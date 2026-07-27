import React, { useEffect, useState } from "react";
import { Mic, Sparkles, UserCheck } from "lucide-react";


export interface InterviewerAvatarProps {
  gender: "female" | "male";
  onGenderChange: (gender: "female" | "male") => void;
  status: "speaking" | "listening" | "thinking" | "idle";
  interviewerName: string;
  speakingBoundaryTick?: number; // increments on speech word boundaries to drive lip movement
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  gender,
  onGenderChange,
  status,
  interviewerName,
  speakingBoundaryTick = 0,
}) => {
  const [mouthScaleY, setMouthScaleY] = useState(1);
  const avatarImage = gender === "female" ? "/avatars/female.png" : "/avatars/male.png";

  // Real-time lip-sync effect driven by speech boundary ticks & audio oscillation
  useEffect(() => {
    if (status === "speaking") {
      // Trigger a dynamic lip mouth opening on boundary ticks
      const mouthOpenness = 0.4 + Math.random() * 0.9;
      setMouthScaleY(mouthOpenness);

      const timer = setTimeout(() => {
        setMouthScaleY(0.2);
      }, 140);

      return () => clearTimeout(timer);
    } else {
      setMouthScaleY(0.1);
    }
  }, [status, speakingBoundaryTick]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/50 via-card to-card p-6 text-center shadow-xl space-y-4">
      {/* Background Glow */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full blur-3xl transition-all duration-700 ${
          status === "speaking"
            ? "bg-indigo-500/40 scale-125"
            : status === "listening"
            ? "bg-purple-500/30 scale-110"
            : "bg-indigo-500/15"
        }`}
      />

      {/* Avatar Container with Animated Glow & Lip Sync */}
      <div className="relative inline-block mx-auto">
        <div
          className={`relative h-44 w-44 md:h-52 md:w-52 rounded-full p-1.5 transition-all duration-300 ${
            status === "speaking"
              ? "ring-4 ring-indigo-500 shadow-2xl shadow-indigo-500/60"
              : status === "listening"
              ? "ring-4 ring-purple-500 shadow-xl shadow-purple-500/40"
              : "ring-2 ring-indigo-500/30"
          }`}
        >
          {/* Main Avatar Image */}
          <img
            src={avatarImage}
            alt={`${interviewerName} AI Interviewer`}
            className="h-full w-full rounded-full object-cover shadow-inner"
          />

          {/* Dynamic Animated Lip-Sync Overlay */}
          {status === "speaking" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Mouth movement overlay positioned near lower third of headshot */}
              <div
                className="w-10 h-4 bg-red-950/80 rounded-full border border-red-500/50 shadow-md transition-transform duration-100 ease-out"
                style={{
                  transform: `translateY(36px) scaleY(${mouthScaleY * 1.8}) scaleX(${
                    1 + mouthScaleY * 0.3
                  })`,
                }}
              >
                <div className="w-full h-1 bg-rose-300/80 rounded-full mx-auto mt-0.5" />
              </div>
            </div>
          )}

          {/* Animated Equalizer Wave Overlay while speaking */}
          {status === "speaking" && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full bg-indigo-950/90 border border-indigo-500/50 px-3 py-1 text-white shadow-xl text-xs font-bold">
              <span
                className="w-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ height: `${8 + Math.random() * 12}px`, animationDelay: "0ms" }}
              />
              <span
                className="w-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ height: `${12 + Math.random() * 14}px`, animationDelay: "150ms" }}
              />
              <span
                className="w-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ height: `${10 + Math.random() * 12}px`, animationDelay: "300ms" }}
              />
              <span className="ml-1 text-[11px] text-indigo-200">Speaking...</span>
            </div>
          )}

          {/* Listening Badge */}
          {status === "listening" && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-purple-950/90 border border-purple-500/50 px-3.5 py-1 text-white shadow-xl text-xs font-bold">
              <Mic className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span>Listening to you...</span>
            </div>
          )}

          {/* Thinking Badge */}
          {status === "thinking" && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-indigo-950/90 border border-indigo-500/50 px-3.5 py-1 text-white shadow-xl text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
              <span>Thinking response...</span>
            </div>
          )}
        </div>
      </div>

      {/* Voice & Gender Controls */}
      <div className="space-y-3 relative z-10">
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
            <span>Female Voice (Priya)</span>
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
            <span>Male Voice (Rohan)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Mic, Sparkles, UserCheck } from "lucide-react";

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
  const [mouthOpenness, setMouthOpenness] = useState(0.2);
  const avatarImage = gender === "female" ? "/avatars/female.png" : "/avatars/male.png";

  // Dynamic realistic lip-syncing driven by speech boundary ticks & speech waveform
  useEffect(() => {
    if (status === "speaking") {
      // Dynamic viseme mouth opening calculation
      const openness = 0.3 + Math.random() * 0.7;
      setMouthOpenness(openness);

      const timer = setTimeout(() => {
        setMouthOpenness(0.15);
      }, 120);

      return () => clearTimeout(timer);
    } else {
      setMouthOpenness(0.05);
    }
  }, [status, speakingBoundaryTick]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 via-card to-card p-6 text-center shadow-xl space-y-4">
      {/* Ambient Pulsing Glow Background */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full blur-3xl transition-all duration-700 ${
          status === "speaking"
            ? "bg-indigo-500/45 scale-125"
            : status === "listening"
            ? "bg-purple-500/35 scale-110"
            : "bg-indigo-500/15"
        }`}
      />

      {/* Avatar Headshot Container with Animated Ring & Lip-Sync Morph */}
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
          {/* Main Professional Indian Avatar Image */}
          <img
            src={avatarImage}
            alt={`${interviewerName} AI Interviewer`}
            className="h-full w-full rounded-full object-cover shadow-inner"
          />

          {/* Ultra-Smooth SVG Viseme Mouth Lip-Sync Overlay */}
          {status === "speaking" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{
                  transform: "translateY(16px)",
                }}
              >
                {/* Lip Shape Viseme Morphing */}
                <ellipse
                  cx="50"
                  cy="68"
                  rx={10 + mouthOpenness * 4}
                  ry={2 + mouthOpenness * 7}
                  fill="#4A0404"
                  opacity="0.85"
                  className="transition-all duration-75 ease-out"
                />
                {/* Upper Lip Contour */}
                <path
                  d={`M ${40 - mouthOpenness * 2} 66 Q 50 ${
                    65 - mouthOpenness * 2
                  } ${60 + mouthOpenness * 2} 66`}
                  stroke="#8B2500"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Lower Lip Line */}
                <path
                  d={`M ${42 - mouthOpenness * 2} ${68 + mouthOpenness * 6} Q 50 ${
                    71 + mouthOpenness * 7
                  } ${58 + mouthOpenness * 2} ${68 + mouthOpenness * 6}`}
                  stroke="#A52A2A"
                  strokeWidth="1.2"
                  fill="none"
                />
              </svg>
            </div>
          )}

          {/* Speaking Audio Equalizer Waveform */}
          {status === "speaking" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-indigo-950/95 border border-indigo-500/60 px-3.5 py-1 text-white shadow-2xl text-xs font-bold backdrop-blur">
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
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-purple-950/95 border border-purple-500/60 px-3.5 py-1 text-white shadow-2xl text-xs font-bold backdrop-blur">
              <Mic className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span>Listening to you...</span>
            </div>
          )}

          {/* Thinking Badge */}
          {status === "thinking" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-indigo-950/95 border border-indigo-500/60 px-3.5 py-1 text-white shadow-2xl text-xs font-bold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
              <span>Evaluating response...</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Persona Information */}
      <div className="space-y-3 relative z-10">
        <div>
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            {interviewerName}
          </h3>
          <p className="text-xs text-indigo-300 font-medium mt-0.5">
            Senior Professional Interviewer • Indian Accent
          </p>
        </div>

        {/* Voice & Persona Switcher */}
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

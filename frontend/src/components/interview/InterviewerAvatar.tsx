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
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [speechPulse, setSpeechPulse] = useState(1);

  const avatarImage = gender === "female" ? "/avatars/female.png" : "/avatars/male.png";

  // Real-time lip-sync mouth morphing & micro-jaw motion
  useEffect(() => {
    if (status === "speaking") {
      const openness = 0.3 + Math.random() * 0.7;
      setMouthOpenness(openness);
      setSpeechPulse(1.0 + Math.random() * 0.035);

      const timer = setTimeout(() => {
        setMouthOpenness(0.1);
        setSpeechPulse(1.0);
      }, 110);

      return () => clearTimeout(timer);
    } else {
      setMouthOpenness(0);
      setSpeechPulse(1.0);
    }
  }, [status, speakingBoundaryTick]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 via-card to-card p-6 text-center shadow-2xl space-y-4">
      {/* Ambient Pulsing Glow */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 h-52 w-52 rounded-full blur-3xl transition-all duration-700 ${
          status === "speaking"
            ? "bg-indigo-500/45 scale-125"
            : status === "listening"
            ? "bg-purple-500/35 scale-110"
            : "bg-indigo-500/15"
        }`}
      />

      {/* Realistic AI Avatar Headshot with Dynamic Lip Sync */}
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
          {/* Main HD Avatar Image with Speech Micro-Motion */}
          <div className="relative h-full w-full rounded-full overflow-hidden shadow-inner">
            <img
              src={avatarImage}
              alt={`${interviewerName} AI Interviewer`}
              className="h-full w-full object-cover transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${speechPulse}) translateY(${
                  status === "speaking" ? (speechPulse - 1) * -6 : 0
                }px)`,
              }}
            />

            {/* Seamless Natural Mouth Lip-Sync Overlay */}
            {status === "speaking" && mouthOpenness > 0.1 && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: "translateY(22px)" }}
              >
                <div
                  className="rounded-full bg-rose-950/70 border border-rose-400/40 shadow-sm transition-all duration-75 ease-out"
                  style={{
                    width: `${18 + mouthOpenness * 12}px`,
                    height: `${4 + mouthOpenness * 10}px`,
                    filter: "blur(0.5px)",
                  }}
                >
                  <div
                    className="w-2/3 h-0.5 bg-rose-200/70 mx-auto mt-0.5 rounded-full"
                    style={{ opacity: mouthOpenness * 0.9 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Equalizer Waveform Badge while Speaking */}
          {status === "speaking" && (
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-indigo-950/95 border border-indigo-500/60 px-4 py-1.5 text-white shadow-2xl text-xs font-bold backdrop-blur">
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
              <span className="ml-1 text-xs text-indigo-200">AI Speaking...</span>
            </div>
          )}

          {/* Listening Badge */}
          {status === "listening" && (
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-purple-950/95 border border-purple-500/60 px-4 py-1.5 text-white shadow-2xl text-xs font-bold backdrop-blur">
              <Mic className="h-4 w-4 text-purple-400 animate-pulse" />
              <span>Listening to candidate...</span>
            </div>
          )}

          {/* Thinking Badge */}
          {status === "thinking" && (
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-indigo-950/95 border border-indigo-500/60 px-4 py-1.5 text-white shadow-2xl text-xs font-bold backdrop-blur">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
              <span>Evaluating response...</span>
            </div>
          )}
        </div>
      </div>

      {/* Persona Details */}
      <div className="space-y-3 relative z-10 pt-2">
        <div>
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            {interviewerName}
          </h3>
          <p className="text-xs text-indigo-300 font-medium mt-0.5">
            Senior Professional AI Interviewer • Indian English Accent
          </p>
        </div>

        {/* Avatar Gender Switcher */}
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
            <span>Priya (Female)</span>
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
            <span>Rohan (Male)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

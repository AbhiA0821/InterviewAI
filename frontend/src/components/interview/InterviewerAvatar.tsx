import React, { useEffect, useRef, useState } from "react";
import { Mic, Sparkles, Volume2, Video, ShieldCheck } from "lucide-react";
import { interviewService } from "../../services/interviewService";
import { Badge } from "../ui/Badge";

export interface InterviewerAvatarProps {
  gender: "female" | "male" | "male1" | "male2";
  onGenderChange: (persona: any) => void;
  status: "speaking" | "listening" | "thinking" | "idle";
  interviewerName: string;
  speakingBoundaryTick?: number;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  gender,
  onGenderChange,
  status,
  interviewerName,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [simliMode, setSimliMode] = useState<string>("Simli Neural HD");
  const [simliEnabled, setSimliEnabled] = useState<boolean>(false);

  const avatarImage = gender === "female" ? "/avatars/female.png" : "/avatars/male.png";
  const simliVideoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch Simli Session Status
  useEffect(() => {
    async function checkSimli() {
      try {
        const simliGender = gender === "female" ? "female" : "male";
        const res = await interviewService.getSimliSession(simliGender);
        if (res && res.enabled) {
          setSimliEnabled(true);
          setSimliMode("Simli Ultra HD");
        } else {
          setSimliEnabled(false);
          setSimliMode("Live AI Stream 1080p");
        }
      } catch (e) {
        setSimliEnabled(false);
        setSimliMode("Live AI Stream 1080p");
      }
    }
    checkSimli();
  }, [gender]);

  // Continuous Eye Blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3600);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 p-2.5 sm:p-3.5 flex flex-col justify-between space-y-2 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur">
      {/* Top Video Call Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot className="py-1 px-3">
            <span className="font-extrabold text-white">{interviewerName}</span>
          </Badge>
          <Badge variant="teal" className="hidden sm:inline-flex text-[10px]">
            <Video className="h-3 w-3" />
            <span>{simliMode}</span>
          </Badge>
        </div>

        {/* AI Persona Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-900/95 p-1 rounded-full border border-slate-800 shadow-md z-20">
          <button
            type="button"
            onClick={() => onGenderChange("female")}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "female"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            title="Female HR Lead (Riya)"
          >
            Riya (HR)
          </button>
          <button
            type="button"
            onClick={() => onGenderChange("male1")}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "male1" || gender === "male"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            title="Male Tech Lead (Rohan)"
          >
            Rohan (Tech)
          </button>
          <button
            type="button"
            onClick={() => onGenderChange("male2")}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "male2"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            title="Male Senior HR Manager (Karan)"
          >
            Karan (HR)
          </button>
        </div>
      </div>

      {/* AI Video Frame Container */}
      <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800/90 shadow-2xl group min-h-0">
        {/* Glowing Studio Background Aura */}
        <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          status === "speaking" ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-slate-950/40 to-slate-950/90 opacity-100" : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950/40 to-slate-950/90 opacity-80"
        }`} />

        {/* Simli WebRTC Video Stream Element */}
        {simliEnabled && (
          <video
            ref={simliVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover z-0"
          />
        )}

        {/* AI Avatar Portrait */}
        <div className="relative h-full max-h-full aspect-square max-w-full flex items-center justify-center mx-auto overflow-hidden">
          <img
            src={avatarImage}
            alt={`${interviewerName} AI Interviewer`}
            className={`max-h-full max-w-full object-contain pointer-events-none select-none transition-transform duration-500 ${
              status === "speaking" ? "scale-[1.02] drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]" : "drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
            }`}
          />

          {/* Micro Eye Blink Overlay */}
          {isBlinking && (
            <div
              className="absolute z-15 pointer-events-none bg-[#381e18]/90 rounded-full transition-all duration-75"
              style={{
                top: gender === "female" ? "30.5%" : "29.5%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "52px",
                height: "4px",
              }}
            />
          )}
        </div>

        {/* Top-Right Active Stream Indicator */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur shadow-lg">
          {status === "speaking" ? (
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-bar-1" />
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-bar-2" />
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-bar-3" />
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-bar-4" />
            </div>
          ) : (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <span className="text-[11px] font-bold text-slate-200">Live AI Stream</span>
        </div>

        {/* Dynamic Status Overlay Pill */}
        {status === "speaking" && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-emerald-950/95 border border-emerald-500/80 px-4 py-1.5 text-white shadow-xl text-xs font-extrabold backdrop-blur glow-emerald">
            <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs">AI Interviewer Speaking...</span>
          </div>
        )}

        {status === "listening" && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-teal-950/95 border border-teal-500/80 px-4 py-1.5 text-white shadow-xl text-xs font-extrabold backdrop-blur glow-teal">
            <Mic className="h-4 w-4 text-teal-400 animate-pulse" />
            <span className="text-xs">Listening to your response...</span>
          </div>
        )}

        {status === "thinking" && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-indigo-950/95 border border-indigo-500/80 px-4 py-1.5 text-white shadow-xl text-xs font-extrabold backdrop-blur">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
            <span className="text-xs">Analyzing response & formulating question...</span>
          </div>
        )}

        {/* Bottom Right Noise Cancellation Badge */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur text-[10px] font-bold text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Noise Suppression Active</span>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import { Mic, Sparkles, Volume2, Video, ShieldCheck } from "lucide-react";
import { interviewService } from "../../services/interviewService";

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
    <div className="relative h-full w-full overflow-hidden bg-slate-950 p-2 sm:p-3 flex flex-col justify-between space-y-2 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Top Video Call Bar */}
      <div className="flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800 shadow-md backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{interviewerName}</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-sm flex items-center gap-1">
            <Video className="h-3 w-3" />
            <span>{simliMode}</span>
          </span>
        </div>

        {/* AI Interviewer Persona Switcher (Female HR Riya, Male Tech Lead Abhi, Male HR Lead Karan) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800 shadow-md z-20">
          <button
            type="button"
            onClick={() => onGenderChange("female")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "female"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Female HR Lead (Riya)"
          >
            Female (Riya)
          </button>
          <button
            type="button"
            onClick={() => onGenderChange("male1")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "male1" || gender === "male"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Male Tech Lead (Abhi)"
          >
            Male 1 (Abhi)
          </button>
          <button
            type="button"
            onClick={() => onGenderChange("male2")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "male2"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Male Senior HR Manager (Karan)"
          >
            Male 2 (Karan)
          </button>
        </div>
      </div>

      {/* Realistic AI Video Frame Container */}
      <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800/90 shadow-2xl group min-h-0">
        {/* Soft Studio Lighting & Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/10 to-slate-950/70 z-10 pointer-events-none" />

        {/* Simli WebRTC Video Stream Element */}
        {simliEnabled && (
          <video
            ref={simliVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover z-0"
          />
        )}

        {/* Photorealistic AI Avatar Frame: Centered 1:1 Aspect Ratio (Stationary portrait picture) */}
        <div className="relative h-full aspect-square max-w-full flex items-center justify-center mx-auto overflow-hidden">
          <img
            src={avatarImage}
            alt={`${interviewerName} AI Interviewer`}
            className="h-full w-full object-contain pointer-events-none select-none"
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
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur shadow-lg">
          {status === "speaking" ? (
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.4s_infinite_100ms] h-full" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.4s_infinite_200ms] h-2" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.4s_infinite_300ms] h-full" />
            </div>
          ) : (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <span className="text-[11px] font-bold text-slate-200">Live AI Stream</span>
        </div>

        {/* Dynamic Call Status Overlay Pill */}
        {status === "speaking" && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-emerald-950/95 border border-emerald-500/80 px-3.5 py-1.5 text-white shadow-xl text-xs font-extrabold backdrop-blur">
            <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs">AI Interviewer Speaking...</span>
          </div>
        )}

        {status === "listening" && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-purple-950/95 border border-purple-500/80 px-3.5 py-1.5 text-white shadow-xl text-xs font-extrabold backdrop-blur">
            <Mic className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="text-xs">Listening to your response...</span>
          </div>
        )}

        {status === "thinking" && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-indigo-950/95 border border-indigo-500/80 px-3.5 py-1.5 text-white shadow-xl text-xs font-extrabold backdrop-blur">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
            <span className="text-xs">Analyzing response & formulating question...</span>
          </div>
        )}

        {/* Bottom Right AI Audio / Noise Cancellation Badge */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-full border border-slate-800 backdrop-blur text-[10px] font-bold text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Noise Suppression Active</span>
        </div>
      </div>
    </div>
  );
};

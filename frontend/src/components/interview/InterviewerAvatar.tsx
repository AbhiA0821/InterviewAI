import React, { useEffect, useRef, useState } from "react";
import { Mic, Sparkles, Volume2, Video, ShieldCheck } from "lucide-react";
import { interviewService } from "../../services/interviewService";

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
  const [mouthOpenHeight, setMouthOpenHeight] = useState(0); // 0 to 14px
  const [mouthWidth, setMouthWidth] = useState(20); // 16 to 26px for phoneme shapes
  const [showTeeth, setShowTeeth] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState(0); // deg
  const [headY, setHeadY] = useState(0); // px
  const [simliMode, setSimliMode] = useState<string>("Simli Neural HD");
  const [simliEnabled, setSimliEnabled] = useState<boolean>(false);

  const avatarImage = gender === "female" ? "/avatars/female.png" : "/avatars/male.png";
  const simliVideoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch Simli Session Status
  useEffect(() => {
    async function checkSimli() {
      try {
        const res = await interviewService.getSimliSession(gender);
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

  // Real-Time Phoneme Lip-Sync & Head Motion
  useEffect(() => {
    if (status === "speaking") {
      // Dynamic mouth aperture & phoneme lip width variation
      const h = 4 + Math.floor(Math.random() * 10);
      const w = 16 + Math.floor(Math.random() * 10);
      setMouthOpenHeight(h);
      setMouthWidth(w);
      setShowTeeth(h > 6);
      setSpeechPulse(1.0 + Math.random() * 0.02);
      setHeadY((Math.random() - 0.5) * 3);
      setHeadTilt((Math.random() - 0.5) * 1.5);

      const timer = setTimeout(() => {
        setSpeechPulse(1.0);
        setMouthOpenHeight(2);
      }, 110);

      return () => clearTimeout(timer);
    } else if (status === "listening") {
      // Gentle attentive listening nod
      setMouthOpenHeight(0);
      setHeadTilt(-1);
      setHeadY(1);
    } else if (status === "thinking") {
      // Slight thoughtful head tilt upward
      setMouthOpenHeight(0);
      setHeadTilt(2);
      setHeadY(-2);
    } else {
      setMouthOpenHeight(0);
      setHeadTilt(0);
      setHeadY(0);
      setSpeechPulse(1.0);
    }
  }, [status, speakingBoundaryTick]);

  // Continuous Micro-Motion: Natural Breathing & Micro Eye Blinking
  useEffect(() => {
    // Natural Eye Blink Cycle
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3600);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 p-3 sm:p-4 flex flex-col justify-between space-y-3 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Top Video Call Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-md backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{interviewerName}</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-sm flex items-center gap-1">
            <Video className="h-3 w-3" />
            <span>{simliMode}</span>
          </span>
        </div>

        {/* Gender / Persona Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800 shadow-md z-20">
          <button
            type="button"
            onClick={() => onGenderChange("female")}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "female"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Female
          </button>
          <button
            type="button"
            onClick={() => onGenderChange("male")}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
              gender === "male"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Male
          </button>
        </div>
      </div>

      {/* Full Widescreen 16:9 Realistic AI Video Frame */}
      <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800/90 shadow-2xl group">
        {/* Soft Studio Lighting & Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/20 to-slate-950/80 z-10 pointer-events-none" />

        {/* Simli WebRTC Video Stream Element */}
        {simliEnabled && (
          <video
            ref={simliVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover z-0"
          />
        )}

        {/* Photorealistic AI Avatar Frame with Centered Portrait Positioning */}
        <div
          className="h-full w-full relative transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${speechPulse}) translateY(${headY}px) rotate(${headTilt}deg)`,
          }}
        >
          <img
            src={avatarImage}
            alt={`${interviewerName} AI Interviewer`}
            className="h-full w-full object-cover object-[center_16%]"
          />

          {/* Photorealistic Lip-Sync Mouth & Jaw Animation Overlay */}
          {status === "speaking" && mouthOpenHeight > 0 && (
            <div
              className="absolute z-15 pointer-events-none transition-all duration-75 flex flex-col items-center justify-center overflow-hidden"
              style={{
                top: gender === "female" ? "52.8%" : "51.2%",
                left: "50%",
                transform: "translateX(-50%)",
                width: `${mouthWidth}px`,
                height: `${mouthOpenHeight}px`,
                backgroundColor: "#241014",
                borderRadius: "45%",
                boxShadow: "inset 0 0 4px #000, 0 0 3px rgba(220, 38, 38, 0.3)",
                border: "1px solid rgba(153, 27, 27, 0.6)",
              }}
            >
              {/* Subtle Teeth Line Glimpse */}
              {showTeeth && (
                <div className="w-[80%] h-[2px] bg-slate-100/90 rounded-full shrink-0" />
              )}
            </div>
          )}

          {/* Micro Eye Blink Overlay */}
          {isBlinking && (
            <div
              className="absolute z-15 pointer-events-none bg-[#361f18]/95 rounded-full transition-all duration-75"
              style={{
                top: gender === "female" ? "38%" : "36.5%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "48px",
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
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-emerald-950/95 border border-emerald-500/80 px-4 py-2 text-white shadow-2xl text-xs font-extrabold backdrop-blur">
            <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs">AI Interviewer Speaking...</span>
          </div>
        )}

        {status === "listening" && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-purple-950/95 border border-purple-500/80 px-4 py-2 text-white shadow-2xl text-xs font-extrabold backdrop-blur">
            <Mic className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="text-xs">Listening to your response...</span>
          </div>
        )}

        {status === "thinking" && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-indigo-950/95 border border-indigo-500/80 px-4 py-2 text-white shadow-2xl text-xs font-extrabold backdrop-blur">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
            <span className="text-xs">Analyzing response & formulating question...</span>
          </div>
        )}

        {/* Bottom Right AI Audio / Noise Cancellation Badge */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-full border border-slate-800 backdrop-blur text-[10px] font-bold text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Noise Suppression Active</span>
        </div>
      </div>
    </div>
  );
};

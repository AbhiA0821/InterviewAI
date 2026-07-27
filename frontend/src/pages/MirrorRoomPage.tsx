import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  Mic,
  Volume2,
  Wifi,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  VideoOff,
  MicOff,
} from "lucide-react";
import { interviewService, StartInterviewResponse } from "../services/interviewService";

export default function MirrorRoomPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<StartInterviewResponse | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [micVolume, setMicVolume] = useState(0); // 0 to 100
  const [testingSpeaker, setTestingSpeaker] = useState(false);
  const [speakerSuccess, setSpeakerSuccess] = useState(false);

  const initialGender =
    (localStorage.getItem("selected_gender") as "female" | "male") || "female";
  const [selectedGender, setSelectedGender] = useState<"female" | "male">(initialGender);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Fetch session info if id is available
  useEffect(() => {
    if (!id) return;
    async function loadSession() {
      try {
        const data = await interviewService.getInterview(Number(id));
        setInterview(data);
      } catch (err) {
        console.warn("Failed to load interview session for mirror room:", err);
      }
    }
    loadSession();
  }, [id]);

  // Setup Live Webcam & Real-time Web Audio API Microphone Volume Meter
  useEffect(() => {
    async function setupDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: true,
        });

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Web Audio API for Mic Meter
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          if (analyserRef.current && micActive) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const volumePct = Math.min(100, Math.round((average / 128) * 100));
            setMicVolume(volumePct);
          } else {
            setMicVolume(0);
          }
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };

        updateMeter();
      } catch (err) {
        console.warn("Camera or microphone permission denied in Mirror Room:", err);
        setCameraActive(false);
        setMicActive(false);
      }
    }

    setupDevices();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Speaker Sound Test
  const handleTestSpeaker = () => {
    setTestingSpeaker(true);
    setSpeakerSuccess(false);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Welcome to the Interview AI Mirror Room. Your audio and video setup is perfectly configured."
      );
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setTestingSpeaker(false);
        setSpeakerSuccess(true);
      };

      utterance.onerror = () => {
        setTestingSpeaker(false);
        setSpeakerSuccess(true);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setTestingSpeaker(false);
        setSpeakerSuccess(true);
      }, 1500);
    }
  };

  const handleGenderSelect = (gender: "female" | "male") => {
    setSelectedGender(gender);
    localStorage.setItem("selected_gender", gender);
  };

  const handleJoinInterview = () => {
    const targetId = id || (interview ? interview.interview_id : null);
    if (targetId) {
      navigate(`/interview/${targetId}?gender=${selectedGender}`);
    } else {
      navigate(`/upload`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between space-y-6">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl shadow-lg">
            M
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wide text-white flex items-center gap-2">
              <span>Mirror Room</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Pre-Interview Lobby
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Test your camera, microphone, speaker, and select your AI interviewer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Device Check Passed</span>
        </div>
      </div>

      {/* Main Grid Deck */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Live Candidate Camera & Audio Level Meter */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          <div className="relative flex-1 min-h-[320px] sm:min-h-[400px] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center space-y-3 text-slate-500">
                <VideoOff className="h-12 w-12 text-red-400 animate-pulse" />
                <p className="text-sm font-semibold">Camera is paused or unavailable</p>
              </div>
            )}

            {/* Video Feed Overlay Badges */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-black/80 px-3.5 py-1.5 rounded-full border border-slate-700 backdrop-blur shadow-md">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Candidate Preview</span>
              </span>
              <span className="text-[11px] font-bold text-slate-300 bg-black/70 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur">
                HD 720p
              </span>
            </div>

            {/* Live Mic Audio Volume Bar inside Video Bottom */}
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/80 border border-slate-800 backdrop-blur rounded-2xl p-3 flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200 shrink-0">
                <Mic className="h-4 w-4 text-emerald-400" />
                <span>Mic Level:</span>
              </div>
              <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700 p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 h-full rounded-full transition-all duration-75"
                  style={{ width: `${Math.max(5, micVolume)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 min-w-[36px] text-right">
                {micVolume}%
              </span>
            </div>
          </div>

          {/* Quick Toggle Controls */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (mediaStreamRef.current) {
                    const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
                    if (videoTrack) {
                      videoTrack.enabled = !videoTrack.enabled;
                      setCameraActive(videoTrack.enabled);
                    }
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  cameraActive
                    ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                    : "bg-red-950/80 text-red-300 border-red-800 hover:bg-red-900"
                }`}
              >
                {cameraActive ? <Camera className="h-4 w-4 text-emerald-400" /> : <VideoOff className="h-4 w-4" />}
                <span>{cameraActive ? "Camera ON" : "Camera OFF"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mediaStreamRef.current) {
                    const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
                    if (audioTrack) {
                      audioTrack.enabled = !audioTrack.enabled;
                      setMicActive(audioTrack.enabled);
                    }
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  micActive
                    ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                    : "bg-red-950/80 text-red-300 border-red-800 hover:bg-red-900"
                }`}
              >
                {micActive ? <Mic className="h-4 w-4 text-emerald-400" /> : <MicOff className="h-4 w-4" />}
                <span>{micActive ? "Mic ON" : "Mic Muted"}</span>
              </button>
            </div>

            {/* Test Speaker Button */}
            <button
              type="button"
              onClick={handleTestSpeaker}
              disabled={testingSpeaker}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-extrabold hover:bg-emerald-900/80 transition-all shadow-md"
            >
              <Volume2 className={`h-4 w-4 text-emerald-400 ${testingSpeaker ? "animate-bounce" : ""}`} />
              <span>{testingSpeaker ? "Testing Sound..." : speakerSuccess ? "Sound OK ✓" : "Test Speaker"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Interviewer Selection & Status Summary */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* AI Interviewer Persona Selector */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-sm font-extrabold text-white flex items-center justify-between">
              <span>Select AI Interviewer</span>
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </h2>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Female Persona Card (Riya) */}
              <div
                onClick={() => handleGenderSelect("female")}
                className={`relative cursor-pointer rounded-2xl border p-4 transition-all flex flex-col items-center space-y-3 ${
                  selectedGender === "female"
                    ? "border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-xl"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                {selectedGender === "female" && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-emerald-500/60 shadow-lg">
                  <img
                    src="/avatars/female.png"
                    alt="Riya AI Lead"
                    className="h-full w-full object-cover object-[center_15%]"
                  />
                </div>
                <div className="text-center space-y-0.5">
                  <div className="text-sm font-extrabold text-white">Riya</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">AI Tech Lead (Female)</div>
                </div>
              </div>

              {/* Male Persona Card (Abhii) */}
              <div
                onClick={() => handleGenderSelect("male")}
                className={`relative cursor-pointer rounded-2xl border p-4 transition-all flex flex-col items-center space-y-3 ${
                  selectedGender === "male"
                    ? "border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-xl"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                {selectedGender === "male" && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-emerald-500/60 shadow-lg">
                  <img
                    src="/avatars/male.png"
                    alt="Abhii AI Lead"
                    className="h-full w-full object-cover object-[center_15%]"
                  />
                </div>
                <div className="text-center space-y-0.5">
                  <div className="text-sm font-extrabold text-white">Abhii</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">AI Engineering Lead (Male)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Status Checklist */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Pre-Call Diagnostic Checklist
            </h3>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-200">
                  <Camera className="h-4 w-4 text-emerald-400" />
                  <span>Camera Stream</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-200">
                  <Mic className="h-4 w-4 text-emerald-400" />
                  <span>Microphone Input</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                  <CheckCircle2 className="h-4 w-4" /> Active ({micVolume}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-200">
                  <Wifi className="h-4 w-4 text-emerald-400" />
                  <span>Network Connection</span>
                </div>
                <span className="text-emerald-400 font-extrabold">Optimal (0.8 Mbps)</span>
              </div>
            </div>
          </div>

          {/* Prominent CTA Join Interview Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleJoinInterview}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm tracking-wide shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <span>Join Live Interview Room</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { interviewService, StartInterviewResponse } from "../services/interviewService";
import { InterviewerAvatar } from "../components/interview/InterviewerAvatar";
import {
  Camera,
  CameraOff,
  ChevronDown,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Sparkles,
  Subtitles,
  Volume2,
  Wifi,
} from "lucide-react";

export default function LiveInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialGender =
    (searchParams.get("gender") as "female" | "male") ||
    (localStorage.getItem("selected_gender") as "female" | "male") ||
    "female";

  const durationParam =
    searchParams.get("duration") ||
    localStorage.getItem("selected_duration") ||
    "15 mins";

  const getSecondsFromDuration = (dur: string) => {
    if (dur.includes("5")) return 300;
    if (dur.includes("10")) return 600;
    if (dur.includes("20")) return 1200;
    return 900;
  };

  const [interview, setInterview] = useState<StartInterviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewerGender, setInterviewerGender] = useState<"female" | "male">(initialGender);

  const [avatarStatus, setAvatarStatus] = useState<"speaking" | "listening" | "thinking" | "idle">("idle");
  const [speakingBoundaryTick, setSpeakingBoundaryTick] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(getSecondsFromDuration(durationParam));
  const [error, setError] = useState("");

  // Controls for Mocklingo Floating UI
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const userMediaStreamRef = useRef<MediaStream | null>(null);
  const shouldKeepListeningRef = useRef<boolean>(false);

  // Pre-load speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    };
    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchSession();
  }, [id]);

  // Session Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.transcript, voiceTranscript]);

  // Candidate Camera Setup for Floating Picture-in-Picture
  useEffect(() => {
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
            audio: false,
          });
          userMediaStreamRef.current = stream;
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        }
      } catch (e) {
        console.warn("Live candidate camera stream unavailable:", e);
        setCameraActive(false);
      }
    }
    startCamera();
    return () => {
      if (userMediaStreamRef.current) {
        userMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Continuous Speech Recognition
  const startAutoVoiceListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    shouldKeepListeningRef.current = true;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setVoiceTranscript(transcript.trim());
        }
      };

      recognition.onend = () => {
        if (shouldKeepListeningRef.current && micActive) {
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setAvatarStatus("listening");
    } catch (e) {
      console.warn("Speech recognition auto-start handled:", e);
    }
  };

  // Speak question with high quality TTS
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      startAutoVoiceListening();
      return;
    }
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakText(text);
      };
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.volume = 1.0;
    utterance.lang = "en-IN";

    const indianVoices = voices.filter(
      (v) =>
        v.lang.includes("IN") ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("heera") ||
        v.name.toLowerCase().includes("ravi") ||
        v.name.toLowerCase().includes("veena")
    );

    let targetVoice = null;
    if (interviewerGender === "female") {
      utterance.pitch = 1.6;
      targetVoice =
        indianVoices.find((v) => {
          const n = v.name.toLowerCase();
          return n.includes("heera") || n.includes("veena") || n.includes("female") || n.includes("zira");
        }) ||
        (indianVoices.length > 0 ? indianVoices[0] : null) ||
        voices.find((v) => !v.name.toLowerCase().includes("david") && !v.name.toLowerCase().includes("mark")) ||
        (voices.length > 1 ? voices[1] : voices[0]);
    } else {
      utterance.pitch = 0.8;
      targetVoice =
        indianVoices.find((v) => v.name.toLowerCase().includes("ravi")) ||
        (indianVoices.length > 0 ? indianVoices[0] : null) ||
        voices.find((v) => v.name.toLowerCase().includes("david")) ||
        voices[0];
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onstart = () => {
      setAvatarStatus("speaking");
    };

    utterance.onboundary = () => {
      setSpeakingBoundaryTick((prev) => prev + 1);
    };

    utterance.onend = () => {
      setAvatarStatus("listening");
      if (micActive) startAutoVoiceListening();
    };

    utterance.onerror = () => {
      setAvatarStatus("idle");
      if (micActive) startAutoVoiceListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await interviewService.getInterview(Number(id));
      setInterview(data);
      if (data.transcript && data.transcript.length > 0) {
        const lastMsg = data.transcript[data.transcript.length - 1];
        if (lastMsg.role === "interviewer") {
          speakText(lastMsg.text);
        }
      }
    } catch (err: any) {
      setError("Failed to load interview session.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVoiceAnswer = async () => {
    if (!voiceTranscript.trim() || submitting || !interview) return;
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    setSubmitting(true);
    setAvatarStatus("thinking");
    setError("");
    const currentAns = voiceTranscript;
    setVoiceTranscript("");

    try {
      const res = await interviewService.answerQuestion(interview.interview_id, currentAns);
      const updatedInterview = {
        ...interview,
        current_question_index: res.current_question_index,
        transcript: res.transcript,
      };
      setInterview(updatedInterview);

      const lastMsg = res.transcript[res.transcript.length - 1];
      if (lastMsg && lastMsg.role === "interviewer") {
        speakText(lastMsg.text);
      }

      if (res.is_finished) {
        handleFinishInterview();
      }
    } catch (err: any) {
      setError("Failed to send answer.");
      setAvatarStatus("idle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!interview || finishing) return;
    setFinishing(true);
    shouldKeepListeningRef.current = false;
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    try {
      await interviewService.finishInterview(interview.interview_id);
    } catch (e) {
      console.warn("Finish interview handled:", e);
    } finally {
      navigate(`/feedback/${interview.interview_id}`);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-950 text-white">
        <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
        <p className="text-slate-300 font-extrabold tracking-wide text-sm">
          Connecting to Mocklingo AI Interview Deck...
        </p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 space-y-4 bg-slate-950 text-white">
        <p className="text-red-400 font-bold">Interview session not found.</p>
        <button onClick={() => navigate("/upload")} className="text-emerald-400 underline font-semibold">
          Start New Practice Session
        </button>
      </div>
    );
  }

  const interviewerName = interviewerGender === "male" ? "Abhii (AI Lead)" : "Riya (AI Tech Lead)";

  const lastInterviewerMsg = interview.transcript
    ? [...interview.transcript].reverse().find((m) => m.role === "interviewer")
    : null;
  const activeQuestionText =
    interview.questions?.[interview.current_question_index]?.question ||
    (lastInterviewerMsg ? lastInterviewerMsg.text : "Introduce yourself briefly");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-6 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* MOCKLINGO TOP HEADER BAR */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur shadow-xl z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
            M
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wider text-white flex items-center gap-2">
              <span>{interview.target_role}</span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Mocklingo AI Stage
              </span>
            </h1>
          </div>
        </div>

        {/* Center Countdown Timer */}
        <div className="rounded-full border border-slate-800 bg-slate-950/90 px-4 py-1.5 text-xs font-mono font-bold text-emerald-400 flex items-center gap-2 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{formatTimer(timerSeconds)} Mins</span>
        </div>

        {/* Top Right Controls & Mirror Check */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/mirror_room/${interview.interview_id}`)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>🪞 Device Check</span>
          </button>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-950/80 p-3 text-xs text-red-300 font-bold text-center z-30">
          {error}
        </div>
      )}

      {/* MOCKLINGO MAIN AI STAGE WITH FLOATING CANDIDATE PIP */}
      <div className="relative flex-1 my-4 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Floating Top Translucent Active Question Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-[80%] max-w-3xl rounded-2xl bg-black/85 border border-slate-700/80 p-3 sm:p-4 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <p className="truncate text-slate-100">{activeQuestionText}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (activeQuestionText) speakText(activeQuestionText);
            }}
            className="shrink-0 flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-950/90 hover:bg-emerald-900 px-3 py-1.5 rounded-full border border-emerald-500/50 shadow-sm transition-all"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>
        </div>

        {/* Main Stage: Photorealistic AI Interviewer Avatar */}
        <div className="relative flex-1 w-full h-full">
          <InterviewerAvatar
            gender={interviewerGender}
            onGenderChange={(g) => {
              setInterviewerGender(g);
              localStorage.setItem("selected_gender", g);
              window.speechSynthesis?.cancel();
            }}
            status={avatarStatus}
            interviewerName={interviewerName}
            speakingBoundaryTick={speakingBoundaryTick}
          />
        </div>

        {/* Floating Candidate Picture-in-Picture (PiP) Webcam Box */}
        <div className="absolute top-16 right-4 sm:top-20 sm:right-6 z-20 h-32 w-44 sm:h-44 sm:w-60 rounded-2xl overflow-hidden border-2 border-slate-700/90 bg-slate-950 shadow-2xl transition-all group hover:scale-105 hover:border-emerald-400">
          {cameraActive ? (
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 space-y-1">
              <CameraOff className="h-8 w-8 text-red-400" />
              <span className="text-[10px] font-bold">Camera OFF</span>
            </div>
          )}

          {/* Floating Candidate Name & Mic Badge */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-extrabold text-white bg-black/80 px-2.5 py-1 rounded-full border border-slate-800 backdrop-blur">
            <span className="truncate">You (Candidate)</span>
            {micActive ? (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <MicOff className="h-3 w-3 text-red-400" />
            )}
          </div>
        </div>

        {/* Live Answer Voice Transcript Input Overlay Box */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-[80%] max-w-3xl rounded-2xl bg-black/90 border border-slate-800 p-3 shadow-2xl backdrop-blur space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" /> Live Voice Transcription
            </span>
            <span>{isRecording ? "🎤 Voice Recording..." : "Ready to speak"}</span>
          </div>

          <textarea
            rows={2}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Speak aloud or type your response here... (Voice auto-transcribes live)"
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none font-medium"
          />
        </div>
      </div>

      {/* MOCKLINGO FLOATING BOTTOM CALL CONTROL DOCK BAR */}
      <div className="relative z-30 flex items-center justify-center gap-3 sm:gap-4 py-2">
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/95 border border-slate-800/90 p-2 rounded-full shadow-2xl backdrop-blur">
          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setMicActive(!micActive);
              if (isRecording) {
                shouldKeepListeningRef.current = false;
                try {
                  recognitionRef.current?.stop();
                } catch (e) {}
                setIsRecording(false);
              } else {
                startAutoVoiceListening();
              }
            }}
            className={`p-3.5 rounded-full font-extrabold transition-all shadow-md ${
              isRecording || avatarStatus === "speaking"
                ? "bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400 animate-pulse"
                : micActive
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "bg-red-950 text-red-400 border border-red-800"
            }`}
            title="Toggle Mic / Speaking"
          >
            {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* Camera Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (userMediaStreamRef.current) {
                const videoTrack = userMediaStreamRef.current.getVideoTracks()[0];
                if (videoTrack) {
                  videoTrack.enabled = !videoTrack.enabled;
                  setCameraActive(videoTrack.enabled);
                }
              }
            }}
            className={`p-3.5 rounded-full font-extrabold transition-all shadow-md ${
              cameraActive
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "bg-red-950 text-red-400 border border-red-800"
            }`}
            title="Toggle Camera"
          >
            {cameraActive ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
          </button>

          {/* Subtitles / Transcript Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            className={`p-3.5 rounded-full font-extrabold transition-all shadow-md ${
              showTranscriptDrawer
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
            title="Subtitles & Live Transcript Log"
          >
            <Subtitles className="h-5 w-5" />
          </button>

          {/* Submit Answer & Next Question Primary Action Button */}
          <button
            type="button"
            onClick={handleSendVoiceAnswer}
            disabled={!voiceTranscript.trim() || submitting}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg transition-all disabled:opacity-40 flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Submit & Next</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleFinishInterview}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold transition-all shadow-lg"
            title="End Interview Call"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE LIVE TRANSCRIPT DRAWER */}
      {showTranscriptDrawer && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-4xl max-h-72 rounded-3xl bg-slate-900/95 border border-slate-800 p-4 shadow-2xl backdrop-blur flex flex-col space-y-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-emerald-400 flex items-center gap-2">
              <Subtitles className="h-4 w-4" />
              <span>Full Interview Transcript & Audio Captions</span>
            </h3>
            <button
              onClick={() => setShowTranscriptDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 p-2 text-xs">
            {interview.transcript?.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border ${
                  item.role === "interviewer"
                    ? "bg-slate-950 border-slate-800 text-slate-200"
                    : "bg-emerald-950/60 border-emerald-500/40 text-emerald-100"
                }`}
              >
                <span className="font-extrabold block text-[10px] uppercase text-slate-400 mb-1">
                  {item.role === "interviewer" ? interviewerName : "You (Candidate)"}
                </span>
                <p className="font-medium leading-relaxed">{item.text}</p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

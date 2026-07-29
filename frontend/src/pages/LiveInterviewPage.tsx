import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { interviewService, StartInterviewResponse } from "../services/interviewService";
import { InterviewerAvatar } from "../components/interview/InterviewerAvatar";
import { useFullscreenProctoring } from "../hooks/useFullscreen";
import { getIndianEnglishVoice, correctSpeechPhonetics } from "../utils/voiceUtils";
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
  Maximize,
  Minimize,
  AlertTriangle,
  Video,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";

export default function LiveInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    isFullscreen,
    enterFullscreen,
    toggleFullscreen,
    tabSwitchCount,
    showTabWarning,
    dismissTabWarning,
  } = useFullscreenProctoring();

  const initialGender =
    (searchParams.get("gender") as any) ||
    (localStorage.getItem("selected_gender") as any) ||
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
  const [interviewerGender, setInterviewerGender] = useState<"female" | "male" | "male1" | "male2">(initialGender);

  const [avatarStatus, setAvatarStatus] = useState<"speaking" | "listening" | "thinking" | "idle">("idle");
  const [speakingBoundaryTick, setSpeakingBoundaryTick] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(getSecondsFromDuration(durationParam));
  const [error, setError] = useState("");

  // Controls for Floating UI & Layout Mode
  const [viewMode, setViewMode] = useState<"split" | "pip">("split");
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [activeKeyPoolCount, setActiveKeyPoolCount] = useState<number>(1);
  const [currentKeyIndex, setCurrentKeyIndex] = useState<number>(1);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const userMediaStreamRef = useRef<MediaStream | null>(null);
  const shouldKeepListeningRef = useRef<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsTimeoutRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-trigger proctored fullscreen mode directly on load
  useEffect(() => {
    enterFullscreen();

    const handleFirstInteraction = () => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
    };
  }, []);

  // Connect WebSocket to backend Gemini Live endpoint
  useEffect(() => {
    if (!id) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/interview/${id}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected to Gemini Live Interview socket.");
      setIsWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "session_started") {
          setActiveKeyPoolCount(data.active_key_pool_count || 1);
          setCurrentKeyIndex(data.current_key_index || 1);
        } else if (data.type === "ai_thinking") {
          setAvatarStatus("thinking");
        } else if (data.type === "ai_response") {
          if (data.active_key_pool_count) setActiveKeyPoolCount(data.active_key_pool_count);
          if (data.current_key_index) setCurrentKeyIndex(data.current_key_index);

          setInterview((prev) => {
            if (!prev) return prev;
            const updatedTranscript = [
              ...(prev.transcript || []),
              { role: "interviewer", text: data.text, timestamp: new Date().toISOString() },
            ];
            return {
              ...prev,
              current_question_index: data.question_index,
              transcript: updatedTranscript as any,
            };
          });

          speakText(data.text);
        } else if (data.type === "interview_completed") {
          handleFinishInterview();
        }
      } catch (e) {
        console.warn("[WS] Failed to parse message:", e);
      }
    };

    ws.onclose = () => {
      setIsWsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [id]);

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

  // Continuous Speech Recognition (Indian English)
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
      recognition.lang = "en-IN"; // Strict Indian English Speech Recognition

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const cleaned = correctSpeechPhonetics(transcript.trim());
        if (cleaned) {
          setVoiceTranscript(cleaned);
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

  // Speak question with high quality, confident, loud Indian English TTS
  const speakText = (text: string) => {
    if (ttsTimeoutRef.current) {
      clearTimeout(ttsTimeoutRef.current);
      ttsTimeoutRef.current = null;
    }
    if (!("speechSynthesis" in window)) {
      setAvatarStatus("listening");
      if (micActive) startAutoVoiceListening();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (e) {}

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      const timer = setTimeout(() => speakText(text), 200);
      ttsTimeoutRef.current = timer;
      return;
    }

    const finishSpeaking = () => {
      if (ttsTimeoutRef.current) {
        clearTimeout(ttsTimeoutRef.current);
        ttsTimeoutRef.current = null;
      }
      setAvatarStatus("listening");
      if (micActive) startAutoVoiceListening();
    };

    // Humanize text string with conversational pauses and phonetic spelling for smooth Indian English prosody
    const humanizedText = text
      .replace(/\bAI\b/g, "A.I.")
      .replace(/\bHR\b/g, "H.R.")
      .replace(/\bAPI\b/g, "A.P.I.")
      .replace(/\bSQL\b/g, "Sequel")
      .replace(/([.?!])\s*/g, "$1 ... ")
      .replace(/,\s*/g, ", ");

    const utterance = new SpeechSynthesisUtterance(humanizedText);
    utteranceRef.current = utterance; // Prevent garbage collection bug in Chrome/Edge

    utterance.lang = "en-IN"; // Enforce authentic Indian English phonetic synthesis
    utterance.rate = 0.89; // Humanized conversational pace
    utterance.volume = 1.0;

    const isFemale = interviewerGender === "female" || (interviewerGender as string) === "tanya" || (interviewerGender as string) === "riya";
    if (isFemale) {
      utterance.pitch = 1.05; // Warm, friendly Indian female interviewer tone
    } else if (interviewerGender === "male2") {
      utterance.pitch = 0.88; // Deep, natural Indian male HR manager tone
    } else {
      utterance.pitch = 0.84; // Deep, confident Indian male AI tech lead tone
    }

    const targetVoice = getIndianEnglishVoice(voices, interviewerGender);
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
      finishSpeaking();
    };

    utterance.onerror = () => {
      finishSpeaking();
    };

    // Safety timeout: in case utterance.onend fails or hangs in browser
    const maxDuration = Math.max(6000, (text.length / 10) * 1000 + 4000);
    ttsTimeoutRef.current = setTimeout(() => {
      console.warn("TTS safety timeout reached, forcing transition to listening state.");
      finishSpeaking();
    }, maxDuration);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      finishSpeaking();
    }
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await interviewService.getInterview(Number(id));
      const targetInterviewId = data.interview_id || (data as any).id || Number(id);
      const updatedData: StartInterviewResponse = {
        ...data,
        interview_id: targetInterviewId,
      };
      setInterview(updatedData);
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
    const targetInterviewId = interview.interview_id || (interview as any).id || Number(id);
    if (!targetInterviewId) return;

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

    // Update transcript locally for instantaneous visual feedback
    setInterview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        transcript: [
          ...(prev.transcript || []),
          { role: "user", text: currentAns, timestamp: new Date().toISOString() },
        ] as any,
      };
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: "user_answer", text: currentAns }));
        return;
      } catch (e) {
        console.warn("[WS] Fallback to REST HTTP post:", e);
      } finally {
        setSubmitting(false);
      }
    }

    try {
      const res = await interviewService.answerQuestion(targetInterviewId, currentAns);
      const updatedInterview: StartInterviewResponse = {
        ...interview,
        interview_id: targetInterviewId,
        current_question_index: res.current_question_index,
        transcript: res.transcript,
        questions: res.questions || interview.questions,
      };
      setInterview(updatedInterview);

      const lastMsg = res.transcript[res.transcript.length - 1];
      if (lastMsg && lastMsg.role === "interviewer") {
        speakText(lastMsg.text);
      } else {
        setAvatarStatus("listening");
        if (micActive) startAutoVoiceListening();
      }

      if (res.is_finished) {
        handleFinishInterview();
      }
    } catch (err: any) {
      setError("Failed to send answer. Please try again.");
      setAvatarStatus("idle");
      if (micActive) startAutoVoiceListening();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!interview || finishing) return;
    const targetInterviewId = interview.interview_id || (interview as any).id || Number(id);
    setFinishing(true);
    shouldKeepListeningRef.current = false;
    if (ttsTimeoutRef.current) clearTimeout(ttsTimeoutRef.current);
    try {
      window.speechSynthesis?.cancel();
    } catch (e) {}
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    try {
      await interviewService.finishInterview(targetInterviewId);
    } catch (e) {
      console.warn("Finish interview handled:", e);
    } finally {
      navigate(`/feedback/${targetInterviewId}`);
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
          Connecting to Interview with Abhi AI Deck...
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

  const interviewerName =
    interviewerGender === "female"
      ? "Riya (AI HR Lead)"
      : interviewerGender === "male2"
      ? "Karan (Senior AI HR Manager)"
      : "Rohan (AI Tech Lead)";

  const lastInterviewerMsg = interview.transcript
    ? [...interview.transcript].reverse().find((m) => m.role === "interviewer")
    : null;
  const activeQuestionText =
    (lastInterviewerMsg ? lastInterviewerMsg.text : null) ||
    interview.questions?.[interview.current_question_index]?.question ||
    "Introduce yourself briefly";

  return (
    <div className="h-screen max-h-screen w-full bg-slate-950 text-white flex flex-col justify-between p-2 sm:p-3 relative overflow-hidden font-sans selection:bg-emerald-500/30 select-none">
      {/* Proctoring Tab Switch Warning Overlay */}
      {showTabWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl rounded-2xl bg-red-950/95 border-2 border-red-500/80 p-4 text-white shadow-2xl backdrop-blur flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-300">
                ⚠️ Proctoring Focus Alert (Switches: {tabSwitchCount})
              </h4>
              <p className="text-xs font-medium text-slate-200">
                Tab switching detected! Please keep your focus on the interview screen.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissTabWarning}
            className="shrink-0 px-3 py-1 bg-red-900 hover:bg-red-800 text-xs font-bold rounded-full border border-red-700 text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MOCKLINGO TOP HEADER BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur shadow-xl z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
            M
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-wider text-white flex items-center gap-2">
              <span>{interview.target_role}</span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Interview with Abhi Stage
              </span>
            </h1>
          </div>
        </div>

        {/* Center Countdown Timer & Gemini Pool Badge */}
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-slate-800 bg-slate-950/90 px-3.5 py-1 text-xs font-mono font-bold text-emerald-400 flex items-center gap-2 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{formatTimer(timerSeconds)} Mins</span>
          </div>

          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/40 bg-teal-950/80 text-teal-300 text-xs font-bold shadow-sm"
            title="Active Gemini API Key Rotation Pool for unlimited live tokens"
          >
            <span className={`h-2 w-2 rounded-full ${isWsConnected ? "bg-teal-400" : "bg-amber-400 animate-pulse"}`} />
            <Sparkles className="h-3.5 w-3.5 text-teal-400 animate-spin" style={{ animationDuration: "8s" }} />
            <span>⚡ Gemini Pool (Key {currentKeyIndex}/{activeKeyPoolCount})</span>
          </div>
        </div>

        {/* Top Right Controls & Fullscreen Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all border shadow-sm ${
              isFullscreen
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-400"
                : "bg-indigo-950/90 border-indigo-500/50 text-indigo-300 hover:bg-indigo-900"
            }`}
            title="Toggle native proctored fullscreen mode (Hides browser tabs & address bar)"
          >
            {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "🖥️ Fullscreen Mode"}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === "split" ? "pip" : "split")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Toggle between 50/50 Split Screen and Floating PiP View"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-emerald-400" />
            <span>{viewMode === "split" ? "50/50 Split Screen" : "PiP Focus"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/mirror_room/${interview.interview_id}`)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>🪞 Device Check</span>
          </button>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-950/80 p-2 text-xs text-red-300 font-bold text-center z-30 shrink-0">
          {error}
        </div>
      )}

      {/* MOCKLINGO MAIN AI STAGE CONTAINER */}
      <div className="relative flex-1 my-1.5 sm:my-2 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between min-h-0">
        {/* TOP DEDICATED QUESTION PANEL: Always fully visible & scrollable (never truncated or cut off) */}
        <div className="shrink-0 w-full bg-slate-900/95 border-b border-slate-800 p-3 sm:p-3.5 backdrop-blur z-20 shadow-md space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Question {(interview.current_question_index || 0) + 1} of {interview.questions?.length || 1}</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                AI Interviewer Question
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeQuestionText) speakText(activeQuestionText);
              }}
              className="shrink-0 flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-950/90 hover:bg-emerald-900 px-3 py-1 rounded-full border border-emerald-500/50 shadow-sm transition-all active:scale-95"
              title="Replay interviewer voice reading the question"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Replay Question</span>
            </button>
          </div>

          {/* Full Active Question Text with Custom Scrollbar */}
          <div className="max-h-24 sm:max-h-28 overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-slate-100 text-xs sm:text-sm md:text-base font-semibold leading-relaxed select-text">
              {activeQuestionText}
            </p>
          </div>
        </div>

        {/* CENTER STAGE: 50/50 Split View (Half Avatar, Half Candidate Camera) or Focus PiP View */}
        {viewMode === "split" ? (
          <div className="relative flex-1 w-full min-h-0 bg-slate-950 p-2 sm:p-3 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
            {/* LEFT HALF (50%): AI Interviewer Avatar Container */}
            <div className="h-full w-full min-h-0 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl flex flex-col">
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

            {/* RIGHT HALF (50%): Candidate Live Camera Video Feed Window */}
            <div className="h-full w-full min-h-0 relative rounded-2xl overflow-hidden border-2 border-slate-800/90 bg-slate-950 shadow-2xl flex flex-col justify-between p-2.5 sm:p-3 transition-all group hover:border-emerald-500/50">
              {/* Candidate Top Info Bar */}
              <div className="flex items-center justify-between z-10 shrink-0 mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800 shadow-md backdrop-blur">
                    <span className={`h-2.5 w-2.5 rounded-full ${cameraActive ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
                    <span>You (Candidate)</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                    <Video className="h-3 w-3" />
                    <span>Live HD WebCam</span>
                  </span>
                </div>

                {/* Mic Status Badge */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 text-xs font-bold backdrop-blur">
                  {micActive ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 font-extrabold text-[11px]">Mic Active</span>
                    </>
                  ) : (
                    <>
                      <MicOff className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-red-400 font-extrabold text-[11px]">Muted</span>
                    </>
                  )}
                </div>
              </div>

              {/* Video Stream Element */}
              <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner group min-h-0">
                {cameraActive ? (
                  <video
                    ref={userVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 space-y-2">
                    <CameraOff className="h-10 w-10 text-red-400/80 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-400">Camera Feed Paused</span>
                    <p className="text-[10px] text-slate-500">Click camera button in dock to enable</p>
                  </div>
                )}

                {/* Subtle Glow Overlay */}
                <div className="absolute inset-0 border border-emerald-500/10 pointer-events-none rounded-xl" />

                {/* Bottom Video Stream Status Pills */}
                <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-slate-950/90 border border-slate-800 px-3 py-1 text-white shadow-xl text-xs font-bold backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-[11px]">AI Proctoring Active</span>
                </div>

                <div className="absolute bottom-3 right-3 z-20 hidden sm:flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-full border border-slate-800 backdrop-blur text-[10px] font-bold text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>1080p HD Video</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 w-full min-h-0 bg-slate-950 flex items-center justify-center p-1 sm:p-2 overflow-hidden">
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

            {/* Floating Candidate Picture-in-Picture (PiP) Webcam Box */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 h-24 w-36 sm:h-32 sm:w-48 rounded-xl overflow-hidden border-2 border-slate-700/90 bg-slate-950 shadow-2xl transition-all group hover:border-emerald-400">
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
                  <CameraOff className="h-6 w-6 text-red-400" />
                  <span className="text-[10px] font-bold">Camera OFF</span>
                </div>
              )}

              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] font-extrabold text-white bg-black/80 px-2 py-0.5 rounded-full border border-slate-800 backdrop-blur">
                <span className="truncate">You (Candidate)</span>
                {micActive ? (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <MicOff className="h-3 w-3 text-red-400" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM DEDICATED LIVE ANSWER / VOICE TRANSCRIPTION BOX */}
        <div className="shrink-0 w-full bg-slate-900/95 border-t border-slate-800 p-2.5 sm:p-3 backdrop-blur z-20 shadow-lg space-y-1.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-extrabold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" /> Live Voice Transcription
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isRecording
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}>
              {isRecording ? "🎤 Voice Recording Active..." : "Ready to speak / type"}
            </span>
          </div>

          <textarea
            rows={2}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (voiceTranscript.trim() && !submitting) {
                  handleSendVoiceAnswer();
                }
              }
            }}
            placeholder="Speak aloud or type your response here... Press Enter to submit. (Voice auto-transcribes live)"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none font-medium placeholder:text-slate-500 custom-scrollbar"
          />
        </div>
      </div>

      {/* MOCKLINGO FLOATING BOTTOM CALL CONTROL DOCK BAR */}
      <div className="relative z-30 flex items-center justify-center gap-3 sm:gap-4 py-1 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/95 border border-slate-800/90 p-1.5 rounded-full shadow-2xl backdrop-blur">
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
            className={`p-3 rounded-full font-extrabold transition-all shadow-md ${
              isRecording || avatarStatus === "speaking"
                ? "bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400 animate-pulse"
                : micActive
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "bg-red-950 text-red-400 border border-red-800"
            }`}
            title="Toggle Mic / Speaking"
          >
            {micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
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
            className={`p-3 rounded-full font-extrabold transition-all shadow-md ${
              cameraActive
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "bg-red-950 text-red-400 border border-red-800"
            }`}
            title="Toggle Camera"
          >
            {cameraActive ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </button>

          {/* Subtitles / Transcript Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            className={`p-3 rounded-full font-extrabold transition-all shadow-md ${
              showTranscriptDrawer
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
            title="Subtitles & Live Transcript Log"
          >
            <Subtitles className="h-4 w-4" />
          </button>

          {/* Submit Answer & Next Question Primary Action Button */}
          <button
            type="button"
            onClick={handleSendVoiceAnswer}
            disabled={!voiceTranscript.trim() || submitting}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg transition-all disabled:opacity-40 flex items-center gap-2"
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
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold transition-all shadow-lg"
            title="End Interview Call"
          >
            <PhoneOff className="h-4 w-4" />
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

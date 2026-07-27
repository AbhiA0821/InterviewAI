import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { interviewService, StartInterviewResponse } from "../services/interviewService";
import { InterviewerAvatar } from "../components/interview/InterviewerAvatar";
import { Bot, Camera, CameraOff, CheckCircle, Clock, HelpCircle, Loader2, Mic, MicOff, Send, User, Volume2, VolumeX } from "lucide-react";

export default function LiveInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialGender = (searchParams.get("gender") as "female" | "male") || "female";

  const [interview, setInterview] = useState<StartInterviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [interviewerGender, setInterviewerGender] = useState<"female" | "male">(initialGender);

  const [avatarStatus, setAvatarStatus] = useState<"speaking" | "listening" | "thinking" | "idle">("idle");
  const [speakingBoundaryTick, setSpeakingBoundaryTick] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [error, setError] = useState("");

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchSession();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.transcript]);

  // Real-time Candidate Webcam Stream (Android & Desktop Compatible)
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
            audio: false,
          });
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Camera stream not available or denied:", err);
      }
    }
    if (cameraEnabled) {
      startCamera();
    } else {
      if (userVideoRef.current && userVideoRef.current.srcObject) {
        const tracks = (userVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
        userVideoRef.current.srcObject = null;
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraEnabled]);

  // Speech recognition for voice chat
  const startAutoVoiceListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setAvatarStatus("idle");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setAvatarStatus("listening");
    } catch (e) {
      console.warn("Speech recognition auto-start handled:", e);
    }
  };

  // Speak questions using Web Speech Synthesis with crystal clear female/male voice matching
  const speakText = (text: string) => {
    if (!speechEnabled || !("speechSynthesis" in window)) {
      startAutoVoiceListening();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = interviewerGender === "female" ? 1.25 : 0.95;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let targetVoice = null;

    if (interviewerGender === "female") {
      targetVoice =
        voices.find((v) => {
          const name = v.name.toLowerCase();
          return (
            name.includes("female") ||
            name.includes("zira") ||
            name.includes("priya") ||
            name.includes("heera") ||
            name.includes("veena") ||
            name.includes("samantha") ||
            name.includes("karen") ||
            name.includes("victoria") ||
            name.includes("hazel") ||
            name.includes("catherine")
          );
        }) ||
        voices.find((v) => !v.name.toLowerCase().includes("david") && !v.name.toLowerCase().includes("mark"));
    } else {
      targetVoice =
        voices.find((v) => {
          const name = v.name.toLowerCase();
          return (
            name.includes("male") ||
            name.includes("david") ||
            name.includes("mark") ||
            name.includes("rohan") ||
            name.includes("rishi") ||
            name.includes("george") ||
            name.includes("alex") ||
            name.includes("james")
          );
        }) ||
        voices.find((v) => !v.name.toLowerCase().includes("zira"));
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
      startAutoVoiceListening();
    };

    utterance.onerror = () => {
      setAvatarStatus("idle");
      startAutoVoiceListening();
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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
      setError("Failed to send voice answer.");
      setAvatarStatus("idle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!interview || finishing) return;
    setFinishing(true);
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    try {
      await interviewService.finishInterview(interview.interview_id);
    } catch (err: any) {
      console.warn("Finish interview handled:", err);
    } finally {
      navigate(`/feedback/${interview.interview_id}`);
    }
  };


  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setAvatarStatus("idle");
    } else {
      startAutoVoiceListening();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground font-medium">Entering Face-to-Face AI Interview Room...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">Interview session not found.</p>
        <button onClick={() => navigate("/upload")} className="text-indigo-400 underline">
          Start New Practice Session
        </button>
      </div>
    );
  }

  const currentQNum = interview.current_question_index + 1;
  const totalQNum = interview.questions?.length || 5;
  const interviewerName =
    interviewerGender === "female" ? "Priya (AI Tech Lead)" : "Rohan (AI Principal Engineer)";

  const lastInterviewerMsg = interview.transcript
    ? [...interview.transcript].reverse().find((m) => m.role === "interviewer")
    : null;
  const activeQuestionText =
    interview.questions?.[interview.current_question_index]?.question ||
    (lastInterviewerMsg ? lastInterviewerMsg.text : "");



  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 px-2 sm:px-4">
      {/* Header & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-foreground">
              {interview.target_role} (Live Face-to-Face Video Call)
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="font-medium text-indigo-400">
                Question {currentQNum} of {totalQNum}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (activeQuestionText) {
                speakText(activeQuestionText);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
          >
            <Volume2 className="h-4 w-4 text-indigo-400" />
            <span>Replay Voice</span>
          </button>

          <button
            onClick={() => setCameraEnabled(!cameraEnabled)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              cameraEnabled
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {cameraEnabled ? <Camera className="h-4 w-4 text-emerald-400" /> : <CameraOff className="h-4 w-4" />}
            <span>{cameraEnabled ? "Camera On" : "Camera Off"}</span>
          </button>

          <button
            onClick={() => {
              setSpeechEnabled(!speechEnabled);
              window.speechSynthesis?.cancel();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {speechEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-indigo-400" />
                <span>Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <span>Muted</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishInterview}
            disabled={finishing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
          >
            {finishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scorecard...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Finish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Prominent Active Question Banner Overlay on top of Video Call Deck */}
      <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-card to-violet-950/50 p-5 md:p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <HelpCircle className="h-4 w-4 text-indigo-400" />
          <span>Current Active Question ({currentQNum}/{totalQNum})</span>
        </div>
        <p className="text-base md:text-lg font-extrabold text-foreground leading-snug">
          {activeQuestionText}
        </p>
      </div>

      {/* Face-to-Face Dual 16:9 Widescreen Video Deck (AI Avatar & Candidate Camera Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Video Deck: AI Interviewer 16:9 Widescreen Video Frame */}
        <InterviewerAvatar
          gender={interviewerGender}
          onGenderChange={(g) => {
            setInterviewerGender(g);
            window.speechSynthesis?.cancel();
          }}
          status={avatarStatus}
          interviewerName={interviewerName}
          speakingBoundaryTick={speakingBoundaryTick}
        />

        {/* Right Video Deck: Candidate Live Webcam 16:9 Widescreen Video Frame */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 via-card to-card p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between z-10">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span>You (Candidate Live Stream)</span>
            </span>
            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className="text-xs text-indigo-300 font-semibold hover:underline"
            >
              {cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
            </button>
          </div>

          <div className="relative h-56 md:h-64 w-full rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-indigo-500/30 shadow-inner">
            {cameraEnabled ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <CameraOff className="h-10 w-10 opacity-60" />
                <span className="text-xs font-semibold">Camera Stream Paused</span>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground font-medium pt-0.5">
            <span>Facing AI Interviewer • Real-time Voice Chat</span>
          </div>
        </div>
      </div>

      {/* Transcript & Voice Input Controls */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-8 shadow-md space-y-6">
        <h2 className="font-bold text-lg text-foreground border-b border-border/60 pb-3">
          Interview Conversation Transcript
        </h2>

        <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
          {interview.transcript?.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3.5 ${
                item.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white ${
                  item.role === "user"
                    ? "bg-purple-600"
                    : "bg-gradient-to-tr from-indigo-600 to-violet-600"
                }`}
              >
                {item.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  item.role === "user"
                    ? "bg-purple-600/15 border border-purple-500/20 text-foreground rounded-tr-none"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-foreground rounded-tl-none"
                }`}
              >
                <div className="font-semibold text-xs mb-1 text-muted-foreground">
                  {item.role === "user" ? "You (Candidate)" : interviewerName}
                </div>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Voice-Only Input Section */}
        <div className="pt-4 border-t border-border/60 space-y-4">
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-foreground space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
              <span className="flex items-center gap-1.5">
                <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse text-red-400" : ""}`} />
                <span>{isRecording ? "Microphone Active (Listening...)" : "Voice Chat Only"}</span>
              </span>
              {isRecording && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
            </div>

            <div className="font-medium text-foreground min-h-[48px] italic">
              {voiceTranscript ? (
                `"${voiceTranscript}"`
              ) : isRecording ? (
                <span className="text-muted-foreground not-italic">
                  Speak your answer aloud... (Voice auto-transcribing in real time)
                </span>
              ) : (
                <span className="text-muted-foreground not-italic">
                  Microphone paused. Click "Start Voice Mic" to speak.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                  : "bg-muted text-foreground border border-border hover:bg-accent"
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Pause Mic</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 text-indigo-400" />
                  <span>Start Voice Mic</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendVoiceAnswer}
              disabled={!voiceTranscript.trim() || submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Submit Voice Answer</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

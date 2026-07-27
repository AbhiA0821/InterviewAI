import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { interviewService, StartInterviewResponse } from "../services/interviewService";
import { InterviewerAvatar } from "../components/interview/InterviewerAvatar";
import { Bot, CheckCircle, Clock, Loader2, Mic, MicOff, Send, User, Volume2, VolumeX } from "lucide-react";

export default function LiveInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<StartInterviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [interviewerGender, setInterviewerGender] = useState<"female" | "male">("female");
  const [avatarStatus, setAvatarStatus] = useState<"speaking" | "listening" | "thinking" | "idle">("idle");
  const [speakingBoundaryTick, setSpeakingBoundaryTick] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [error, setError] = useState("");

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

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

  // Start speech recognition for voice-only mode
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
      recognition.lang = "en-IN"; // Indian English speech input

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

  // Read aloud interviewer questions using Web Speech Synthesis with Indian English voice targeting
  const speakText = (text: string) => {
    if (!speechEnabled || !("speechSynthesis" in window)) {
      startAutoVoiceListening();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = interviewerGender === "female" ? 1.1 : 0.9;
    utterance.lang = "en-IN";

    const voices = window.speechSynthesis.getVoices();
    const indianVoice =
      voices.find((v) => {
        const isIndian =
          v.lang.includes("en-IN") || v.lang.includes("hi") || v.name.toLowerCase().includes("india");
        const matchesGender =
          interviewerGender === "female"
            ? v.name.toLowerCase().includes("female") ||
              v.name.toLowerCase().includes("heera") ||
              v.name.toLowerCase().includes("veena") ||
              v.name.toLowerCase().includes("priya")
            : v.name.toLowerCase().includes("male") ||
              v.name.toLowerCase().includes("rishi") ||
              v.name.toLowerCase().includes("rohan") ||
              v.name.toLowerCase().includes("madhur");
        return isIndian && matchesGender;
      }) ||
      voices.find((v) => v.lang.includes("en-IN")) ||
      voices[0];

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onstart = () => {
      setAvatarStatus("speaking");
    };

    utterance.onboundary = () => {
      setSpeakingBoundaryTick((prev) => prev + 1);
    };

    utterance.onend = () => {
      // Auto-turn on microphone when AI finishes speaking!
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
      navigate(`/feedback/${interview.interview_id}`);
    } catch (err: any) {
      setError("Failed to finalize interview.");
      setFinishing(false);
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
        <p className="text-muted-foreground font-medium">Entering Live AI Voice Interview Room...</p>
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-foreground">
              {interview.target_role} (Voice Only)
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

        <div className="flex items-center gap-2">
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
                <span>Generating Scorecard...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Finish & View Feedback</span>
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

      {/* Main Grid: Left Avatar Column, Right Transcript & Voice Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Animated AI Avatar with Lip Sync */}
        <div className="md:col-span-5 lg:col-span-4">
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
        </div>

        {/* Right Column: Voice Chat Transcript & Auto-Mic Controls (Typing Disabled) */}
        <div className="md:col-span-7 lg:col-span-8 rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-md flex flex-col justify-between min-h-[460px]">
          <div className="space-y-4 overflow-y-auto max-h-[360px] pr-2">
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
                    {item.role === "user" ? "You (Voice Input)" : interviewerName}
                  </div>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Voice-Only Input Section (Typing Action Disabled as Requested) */}
          <div className="pt-4 border-t border-border/60 space-y-4">
            {/* Real-time Voice Live Speech Display */}
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
                    Speak your answer aloud... (Voice is auto-transcribing in real time)
                  </span>
                ) : (
                  <span className="text-muted-foreground not-italic">
                    Microphone is paused. Click "Start Voice Chat" to speak.
                  </span>
                )}
              </div>
            </div>

            {/* Voice Action Buttons */}
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
                    <span>Pause Voice Mic</span>
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
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { interviewService, StartInterviewResponse } from "../services/interviewService";
import { Bot, CheckCircle, Clock, Loader2, Mic, MicOff, Send, User, Volume2, VolumeX } from "lucide-react";


export default function LiveInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<StartInterviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
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

  // Read aloud interviewer questions using Web Speech Synthesis
  const speakText = (text: string) => {
    if (!speechEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
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

  const handleSendAnswer = async () => {
    if (!answerText.trim() || submitting || !interview) return;
    setSubmitting(true);
    setError("");
    const currentAns = answerText;
    setAnswerText("");

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
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!interview || finishing) return;
    setFinishing(true);
    window.speechSynthesis?.cancel();
    try {
      await interviewService.finishInterview(interview.interview_id);
      navigate(`/feedback/${interview.interview_id}`);
    } catch (err: any) {
      setError("Failed to finalize interview.");
      setFinishing(false);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
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
        <p className="text-muted-foreground font-medium">Entering Live AI Interview Room...</p>
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
              {interview.target_role} Interview
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

      {/* Main Interview Transcript Box */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-md min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
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
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  item.role === "user"
                    ? "bg-purple-600/15 border border-purple-500/20 text-foreground rounded-tr-none"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-foreground rounded-tl-none"
                }`}
              >
                <div className="font-semibold text-xs mb-1 text-muted-foreground">
                  {item.role === "user" ? "You" : "AI Interviewer"}
                </div>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Answer Input Section */}
        <div className="pt-4 border-t border-border/60 space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your response here or click the microphone to speak..."
              className="w-full rounded-2xl border border-input bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendAnswer();
                }
              }}
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-xl transition-colors ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title={isRecording ? "Stop Voice Recording" : "Start Voice Recording"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={handleSendAnswer}
                disabled={!answerText.trim() || submitting}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Submit</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> to submit answer. Speak or type clearly.
          </p>
        </div>
      </div>
    </div>
  );
}

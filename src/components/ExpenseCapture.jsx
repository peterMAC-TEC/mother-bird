import { useEffect, useRef, useState } from "react";
import { parseExpensePhrase } from "../lib/expenseLogic.js";
import { todayISO } from "../lib/dates.js";

const SpeechRecognitionCtor =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const FEEDBACK_TIMEOUT_MS = 6000;

export default function ExpenseCapture({ onAddExpense, onToggleCategory }) {
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [feedback, setFeedback] = useState(null); // { kind: 'success'|'error', text, entryId?, category? }
  const transcriptRef = useRef("");
  const recognitionRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  if (!SpeechRecognitionCtor) {
    return (
      <p className="empty-state">
        Voice capture needs a browser with speech recognition support (Chrome or Edge).
      </p>
    );
  }

  function scheduleFeedbackClear() {
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), FEEDBACK_TIMEOUT_MS);
  }

  function start() {
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    transcriptRef.current = "";
    recognition.onresult = (event) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) combined += event.results[i][0].transcript;
      transcriptRef.current = combined.trim();
      setLiveText(transcriptRef.current);
    };
    recognition.onerror = (event) => {
      setFeedback({
        kind: "error",
        text: event.error === "not-allowed" ? "Microphone access denied" : "Didn't catch that — try again",
      });
      scheduleFeedbackClear();
    };
    recognition.onend = () => {
      setListening(false);
      const finalText = transcriptRef.current;
      if (!finalText) return;

      const parsed = parseExpensePhrase(finalText);
      if (parsed.amount == null) {
        setFeedback({
          kind: "error",
          text: `Couldn't catch an amount in "${finalText}" — try again, e.g. "40 rupees for tea"`,
        });
        scheduleFeedbackClear();
        return;
      }

      const id = crypto.randomUUID();
      onAddExpense({
        id,
        amountRupees: parsed.amount,
        description: parsed.description || "Expense",
        category: parsed.category,
        rawTranscript: finalText,
        createdAt: todayISO(),
      });
      setFeedback({
        kind: "success",
        text: `Logged ₹${parsed.amount.toLocaleString("en-IN")} — ${parsed.description || "expense"}`,
        entryId: id,
        category: parsed.category,
      });
      scheduleFeedbackClear();
    };

    recognitionRef.current = recognition;
    setLiveText("");
    setFeedback(null);
    setListening(true);
    recognition.start();
  }

  function handleQuickFix() {
    onToggleCategory(feedback.entryId);
    setFeedback((prev) => (prev ? { ...prev, category: prev.category === "business" ? "personal" : "business" } : prev));
  }

  return (
    <div className="expense-capture">
      <button
        type="button"
        className={listening ? "expense-mic-btn expense-mic-btn-listening" : "expense-mic-btn"}
        onClick={start}
        disabled={listening}
        aria-label={listening ? "Listening" : "Log an expense by voice"}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      <div className="expense-capture-copy">
        {listening ? (
          <p className="expense-capture-status">Listening… {liveText}</p>
        ) : (
          <p className="expense-capture-hint">
            Tap the mic and say something like <em>"40 rupees for tea"</em>
          </p>
        )}
        {feedback && (
          <p className={feedback.kind === "error" ? "field-hint-error" : "expense-capture-confirm"}>
            {feedback.text}
            {feedback.kind === "success" && (
              <>
                {" · "}
                <span className={feedback.category === "business" ? "expense-category-pill expense-category-business" : "expense-category-pill expense-category-personal"}>
                  {feedback.category === "business" ? "Business" : "Personal"}
                </span>
                {" "}
                <button type="button" className="expense-quick-fix" onClick={handleQuickFix}>
                  Wrong? Tap to switch
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

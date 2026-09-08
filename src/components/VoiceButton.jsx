import { useEffect, useRef, useState } from "react";

const SpeechRecognitionCtor =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

/** A mic button that dictates speech-to-text; the parent decides what to do with the result. */
export default function VoiceButton({ onResult, label = "Dictate" }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  if (!SpeechRecognitionCtor) return null;

  function start() {
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      onResult(combined.trim());
    };
    recognition.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Microphone access denied" : "Didn't catch that — try again");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return (
    <span className="voice-wrap">
      <button
        type="button"
        className={listening ? "voice-btn voice-btn-listening" : "voice-btn"}
        aria-label={listening ? "Stop dictation" : label}
        aria-pressed={listening}
        onClick={listening ? stop : start}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          {listening ? (
            <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
          ) : (
            <>
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
      {error && <span className="voice-error">{error}</span>}
    </span>
  );
}

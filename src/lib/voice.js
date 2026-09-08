/** True when the browser exposes the Web Speech API for dictation. */
export function isVoiceSupported() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Pulls the first number out of a spoken phrase (e.g. "fifteen hundred" -> "1500" if the
 * browser already transcribed it as digits). Not NLU — just a digit-token regex. */
export function extractNumber(text) {
  const match = text.match(/-?\d+(\.\d+)?/);
  return match ? match[0] : "";
}

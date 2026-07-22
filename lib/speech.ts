// Thin wrapper around the browser Web Speech API for Mandarin TTS.

export function speakMandarin(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.85;

  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("zh"));
  if (zhVoice) utterance.voice = zhVoice;

  window.speechSynthesis.speak(utterance);
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

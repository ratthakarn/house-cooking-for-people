let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, rate = 0.85, pitch = 1.0) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  stop()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'th-TH'
  u.rate = rate
  u.pitch = pitch
  currentUtterance = u
  window.speechSynthesis.speak(u)
}

export function stop() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}

export function isSpeaking(): boolean {
  return typeof window !== 'undefined' && window.speechSynthesis.speaking
}

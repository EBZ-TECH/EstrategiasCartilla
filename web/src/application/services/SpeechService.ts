type SpeechListener = (state: { speaking: boolean; text: string }) => void

function prepareSpeechText(text: string): string {
  return text
    .replace(/[·•]/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function splitChunks(text: string): string[] {
  const prepared = prepareSpeechText(text)
  if (!prepared) return []

  const parts = prepared
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let buffer = ''

  for (const part of parts) {
    const candidate = buffer ? `${buffer} ${part}` : part
    if (candidate.length > 180 && buffer) {
      chunks.push(buffer)
      buffer = part
    } else {
      buffer = candidate
    }
  }

  if (buffer) chunks.push(buffer)
  return chunks.length ? chunks : [prepared]
}

class SpeechService {
  private listeners = new Set<SpeechListener>()
  private speaking = false
  private currentText = ''
  private queue: string[] = []
  private active = false
  private voicesReady: Promise<void> | null = null

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  getState() {
    return { speaking: this.speaking, text: this.currentText }
  }

  subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => this.listeners.delete(listener)
  }

  private notify(speaking: boolean, text = this.currentText) {
    this.speaking = speaking
    if (!speaking) this.currentText = ''
    else this.currentText = text
    const state = this.getState()
    this.listeners.forEach((listener) => listener(state))
  }

  private ensureVoices(): Promise<void> {
    if (!this.isSupported()) return Promise.resolve()
    if (this.voicesReady) return this.voicesReady

    this.voicesReady = new Promise((resolve) => {
      const existing = window.speechSynthesis.getVoices()
      if (existing.length) {
        resolve()
        return
      }

      const done = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', done)
        resolve()
      }

      window.speechSynthesis.addEventListener('voiceschanged', done)
      window.setTimeout(done, 500)
    })

    return this.voicesReady
  }

  private scoreVoice(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase()
    const lang = voice.lang.toLowerCase()
    let score = 0

    if (!lang.startsWith('es')) return -100

    if (lang.includes('es-co') || lang.includes('es_co')) score += 40
    else if (lang.includes('es-mx') || lang.includes('es_mx')) score += 35
    else if (lang.includes('es-us') || lang.includes('es_us')) score += 30
    else if (lang.includes('es-es') || lang.includes('es_es')) score += 25
    else score += 10

    if (name.includes('natural') || name.includes('neural')) score += 50
    if (name.includes('online') || name.includes('premium')) score += 35
    if (name.includes('google')) score += 30
    if (name.includes('sabina') || name.includes('helena') || name.includes('elvira')) score += 28
    if (name.includes('lucia') || name.includes('laura') || name.includes('dalia')) score += 24
    if (name.includes('paulina') || name.includes('catalina') || name.includes('mexican')) score += 22
    if (name.includes('microsoft') && !name.includes('desktop')) score += 12
    if (name.includes('desktop') || name.includes('compact')) score -= 15
    if (voice.localService === false) score += 8

    return score
  }

  private pickSpanishVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices()
    if (!voices.length) return null
    return [...voices].sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a))[0] ?? null
  }

  private speakChunk(chunk: string, fullText: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.active) {
        resolve()
        return
      }

      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = 'es-CO'
      // Un poco más pausado y grave suena menos “robot”
      utterance.rate = 0.92
      utterance.pitch = 0.95
      utterance.volume = 1

      const voice = this.pickSpanishVoice()
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang || 'es-CO'
      }

      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()

      this.notify(true, fullText)
      window.speechSynthesis.speak(utterance)
    })
  }

  private async playQueue(fullText: string) {
    for (let i = 0; i < this.queue.length; i += 1) {
      if (!this.active) break
      await this.speakChunk(this.queue[i], fullText)
      if (!this.active) break
      // Pequeña pausa entre frases para que suene más natural
      await new Promise((resolve) => window.setTimeout(resolve, 180))
    }

    this.queue = []
    this.active = false
    this.notify(false)
  }

  async speak(text: string) {
    if (!this.isSupported() || !text.trim()) return

    this.stop()
    await this.ensureVoices()

    const fullText = text.trim()
    this.queue = splitChunks(fullText)
    this.active = true
    this.currentText = fullText
    this.notify(true, fullText)

    // Chrome a veces necesita cancel + speak en el siguiente tick
    window.speechSynthesis.cancel()
    window.setTimeout(() => {
      void this.playQueue(fullText)
    }, 40)
  }

  stop() {
    if (!this.isSupported()) return
    this.active = false
    this.queue = []
    window.speechSynthesis.cancel()
    this.notify(false)
  }

  toggle(text: string) {
    const clean = text.trim()
    if (this.speaking && this.currentText === clean) {
      this.stop()
      return
    }
    void this.speak(clean)
  }
}

export const speechService = new SpeechService()

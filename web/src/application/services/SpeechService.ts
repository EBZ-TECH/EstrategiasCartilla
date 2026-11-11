type SpeechListener = (state: { speaking: boolean; text: string }) => void

/** Umbral: por encima = voz del navegador (la que te gustaba en PC). */
const QUALITY_VOICE_SCORE = 55

function prepareSpeechText(text: string): string {
  return text
    .replace(/[·•]/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function splitChunks(text: string, maxLen = 180): string[] {
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
    if (candidate.length > maxLen && buffer) {
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
  private audio: HTMLAudioElement | null = null
  private objectUrl: string | null = null
  private preferBrowser = true

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (typeof Audio !== 'undefined' || 'speechSynthesis' in window)
    )
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

  private revokeUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
  }

  private stopAudio() {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    this.revokeUrl()
  }

  private ensureVoices(): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return Promise.resolve()
    }
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
      window.setTimeout(done, 800)
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

    // Google en Chrome/Windows suele ser la que suena natural en PC
    if (name.includes('google')) score += 55
    if (name.includes('natural') || name.includes('neural')) score += 50
    if (name.includes('online') || name.includes('premium')) score += 40
    if (name.includes('sabina') || name.includes('helena') || name.includes('elvira')) score += 32
    if (name.includes('lucia') || name.includes('laura') || name.includes('dalia')) score += 24
    if (name.includes('paulina') || name.includes('catalina') || name.includes('mexican')) score += 22
    if (name.includes('microsoft') && !name.includes('desktop')) score += 12
    if (name.includes('desktop') || name.includes('compact') || name.includes('espeak')) score -= 25
    if (voice.localService === false) score += 10

    return score
  }

  private pickSpanishVoice(): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices.length) return null
    return [...voices].sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a))[0] ?? null
  }

  private hasQualityBrowserVoice(): boolean {
    const voice = this.pickSpanishVoice()
    if (!voice) return false
    return this.scoreVoice(voice) >= QUALITY_VOICE_SCORE
  }

  private async fetchNeuralAudio(chunk: string): Promise<Blob> {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunk }),
    })

    if (!response.ok) {
      throw new Error(`TTS HTTP ${response.status}`)
    }

    return response.blob()
  }

  private playBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.active) {
        resolve()
        return
      }

      this.stopAudio()
      const url = URL.createObjectURL(blob)
      this.objectUrl = url
      const audio = new Audio(url)
      this.audio = audio

      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('No se pudo reproducir el audio'))

      void audio.play().catch(reject)
    })
  }

  private speakBrowserChunk(chunk: string, fullText: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.active || !('speechSynthesis' in window)) {
        resolve()
        return
      }

      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = 'es-CO'
      utterance.rate = 0.92
      utterance.pitch = 1
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
      const chunk = this.queue[i]
      this.notify(true, fullText)

      if (this.preferBrowser) {
        await this.speakBrowserChunk(chunk, fullText)
      } else {
        try {
          const blob = await this.fetchNeuralAudio(chunk)
          if (!this.active) break
          await this.playBlob(blob)
        } catch {
          await this.speakBrowserChunk(chunk, fullText)
        }
      }

      if (!this.active) break
      await new Promise((resolve) => window.setTimeout(resolve, 160))
    }

    this.queue = []
    this.active = false
    this.stopAudio()
    this.notify(false)
  }

  async speak(text: string) {
    if (!this.isSupported() || !text.trim()) return

    this.stop()
    await this.ensureVoices()

    // En PC vuelve la voz buena del navegador; la API solo si el móvil no tiene una decente.
    this.preferBrowser = this.hasQualityBrowserVoice()

    const fullText = text.trim()
    this.queue = splitChunks(fullText, this.preferBrowser ? 180 : 420)
    this.active = true
    this.currentText = fullText
    this.notify(true, fullText)

    if (this.preferBrowser && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    window.setTimeout(() => {
      void this.playQueue(fullText)
    }, 40)
  }

  stop() {
    this.active = false
    this.queue = []
    this.stopAudio()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
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

import { useEffect, useState } from 'react'
import { speechService } from '../../application/services/SpeechService'

export function useSpeech(options?: { stopOnUnmount?: boolean }) {
  const [state, setState] = useState(speechService.getState())
  const supported = speechService.isSupported()
  const stopOnUnmount = options?.stopOnUnmount ?? false

  useEffect(() => speechService.subscribe(setState), [])

  useEffect(() => {
    if (!stopOnUnmount) return
    return () => speechService.stop()
  }, [stopOnUnmount])

  return {
    supported,
    speaking: state.speaking,
    currentText: state.text,
    speak: (text: string) => speechService.speak(text),
    stop: () => speechService.stop(),
    toggle: (text: string) => speechService.toggle(text),
  }
}

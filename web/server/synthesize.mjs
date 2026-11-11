import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

/** Misma voz neural en PC y móvil (Colombia). */
export const TTS_VOICE = 'es-CO-SalomeNeural'

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Sintetiza texto a MP3 con Microsoft Edge Neural TTS.
 * @param {string} text
 * @returns {Promise<Buffer>}
 */
export async function synthesizeTts(text) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1800)

  if (!clean) {
    throw new Error('Texto vacío')
  }

  const tts = new MsEdgeTTS({
    connectionTimeoutMs: 12000,
    synthesisTimeoutMs: 45000,
  })

  try {
    await tts.setMetadata(TTS_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
    const { audioStream } = tts.toStream(escapeXml(clean), { rate: 0.95 })

    const chunks = []
    await new Promise((resolve, reject) => {
      audioStream.on('data', (chunk) => chunks.push(chunk))
      audioStream.on('end', resolve)
      audioStream.on('error', reject)
    })

    return Buffer.concat(chunks)
  } finally {
    tts.close()
  }
}

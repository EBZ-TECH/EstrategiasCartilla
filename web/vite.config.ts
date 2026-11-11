import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function ttsApiPlugin(): Plugin {
  return {
    name: 'tts-api',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.end()
          return
        }

        if (req.method !== 'POST') {
          next()
          return
        }

        try {
          const raw = await readBody(req)
          const body = raw ? (JSON.parse(raw) as { text?: string }) : {}
          // Local ESM helper shared with Vercel /api/tts
          // @ts-expect-error local .mjs has no TS declarations
          const { synthesizeTts } = await import('./server/synthesize.mjs')
          const audio = (await synthesizeTts(body.text ?? '')) as Buffer

          res.statusCode = 200
          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Cache-Control', 'no-store')
          res.end(audio)
        } catch (error) {
          console.error('[vite tts]', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'No se pudo generar el audio' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), ttsApiPlugin()],
})

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'

const MAX_BYTES = 1024 * 1024 // 1 MB de código
const TIMEOUT_MS = 5000

/**
 * Plugin do Vite que expõe `POST /api/compile`: recebe o código FluxLang como
 * texto, roda `../flux --json` com ele na entrada padrão e devolve o JSON do
 * compilador. Vale para `vite` (dev) e `vite preview`; o servidor escuta só
 * em 127.0.0.1 (ver vite.config.ts).
 */
export function fluxApi(): Plugin {
  let fluxPath = ''

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith('/api/compile')) return next()

    const fail = (status: number, error: string) => {
      if (res.headersSent) return
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error }))
    }

    if (req.method !== 'POST') return fail(405, 'Use POST.')

    const chunks: Buffer[] = []
    let size = 0
    let tooBig = false

    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BYTES) {
        tooBig = true
        fail(413, 'Código grande demais (máximo de 1 MB).')
        req.destroy()
        return
      }
      chunks.push(chunk)
    })

    req.on('end', () => {
      if (tooBig) return
      if (!existsSync(fluxPath)) {
        return fail(503, 'O compilador ./flux não foi encontrado. Rode `make` na raiz do projeto.')
      }

      // ?semantic=1 liga a análise semântica (E1 a E22) do compilador
      const semantic = new URL(req.url ?? '', 'http://localhost').searchParams.get('semantic') === '1'
      const args = semantic ? ['--json', '--semantic'] : ['--json']
      const child = spawn(fluxPath, args, { stdio: ['pipe', 'pipe', 'pipe'] })
      const out: Buffer[] = []
      const err: Buffer[] = []
      const timer = setTimeout(() => {
        child.kill('SIGKILL')
        fail(504, 'O compilador demorou mais de 5 segundos.')
      }, TIMEOUT_MS)

      child.stdout.on('data', (c: Buffer) => out.push(c))
      child.stderr.on('data', (c: Buffer) => err.push(c))
      child.stdin.on('error', () => {}) // o flux pode fechar a entrada antes do fim
      child.on('error', (e) => {
        clearTimeout(timer)
        fail(500, `Não foi possível executar o compilador: ${e.message}`)
      })
      child.on('close', (code) => {
        clearTimeout(timer)
        // código 0 = aceito, 1 = rejeitado: nos dois casos há JSON no stdout
        if ((code === 0 || code === 1) && out.length > 0) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(Buffer.concat(out))
        } else {
          const detail = Buffer.concat(err).toString('utf8').trim()
          fail(500, detail || `O compilador terminou com código ${code}.`)
        }
      })
      child.stdin.end(Buffer.concat(chunks))
    })
  }

  return {
    name: 'flux-api',
    configResolved(config) {
      fluxPath = path.resolve(config.root, '../flux')
    },
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

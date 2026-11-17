import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'
import { runProgram } from './run-program.ts'

const MAX_BYTES = 1024 * 1024
const TIMEOUT_MS = 5000

function sendJson(res: ServerResponse, status: number, body: unknown) {
  if (res.headersSent) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

const fail = (res: ServerResponse, status: number, error: string) => sendJson(res, status, { error })

function readBody(req: IncomingMessage, res: ServerResponse): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    let size = 0
    let tooBig = false
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BYTES) {
        tooBig = true
        fail(res, 413, 'Código grande demais (máximo de 1 MB).')
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(tooBig ? null : Buffer.concat(chunks)))
    req.on('error', () => resolve(null))
  })
}

function isTrustedRunRequest(req: IncomingMessage): boolean {
  const host = req.headers.host ?? ''
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return false
  if (req.headers['x-flux-run'] !== '1') return false
  const origin = req.headers.origin
  return origin === undefined || origin === `http://${host}`
}

export function fluxApi(): Plugin {
  let fluxPath = ''

  const compile = async (req: IncomingMessage, res: ServerResponse) => {
    const body = await readBody(req, res)
    if (!body) return
    if (!existsSync(fluxPath)) {
      return fail(res, 503, 'O compilador ./flux não foi encontrado. Rode `make` na raiz do projeto.')
    }

    const semantic = new URL(req.url ?? '', 'http://localhost').searchParams.get('semantic') === '1'
    const args = semantic ? ['--json', '--semantic'] : ['--json']
    const child = spawn(fluxPath, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      fail(res, 504, 'O compilador demorou mais de 5 segundos.')
    }, TIMEOUT_MS)

    child.stdout.on('data', (c: Buffer) => out.push(c))
    child.stderr.on('data', (c: Buffer) => err.push(c))
    child.stdin.on('error', () => {})
    child.on('error', (e) => {
      clearTimeout(timer)
      fail(res, 500, `Não foi possível executar o compilador: ${e.message}`)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if ((code === 0 || code === 1) && out.length > 0) {
        sendJson(res, 200, Buffer.concat(out).toString('utf8'))
      } else {
        const detail = Buffer.concat(err).toString('utf8').trim()
        fail(res, 500, detail || `O compilador terminou com código ${code}.`)
      }
    })
    child.stdin.end(body)
  }

  const run = async (req: IncomingMessage, res: ServerResponse) => {
    if (!isTrustedRunRequest(req)) {
      return fail(res, 403, 'Pedido de execução recusado: só a interface local pode executar programas.')
    }
    const body = await readBody(req, res)
    if (!body) return
    if (!existsSync(fluxPath)) {
      return fail(res, 503, 'O compilador ./flux não foi encontrado. Rode `make` na raiz do projeto.')
    }
    let source: unknown
    let stdin: unknown
    try {
      ;({ source, stdin } = JSON.parse(body.toString('utf8')))
    } catch {
      return fail(res, 400, 'O pedido de execução deve ser um JSON com "source" e "stdin".')
    }
    if (typeof source !== 'string' || (stdin !== undefined && typeof stdin !== 'string')) {
      return fail(res, 400, 'O pedido de execução deve ser um JSON com "source" e "stdin" em texto.')
    }
    try {
      sendJson(res, 200, await runProgram(fluxPath, source, stdin ?? ''))
    } catch (e) {
      fail(res, 500, e instanceof Error ? e.message : String(e))
    }
  }

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url ?? ''
    const route = url.startsWith('/api/run') ? run : url.startsWith('/api/compile') ? compile : null
    if (!route) return next()
    if (req.method !== 'POST') return fail(res, 405, 'Use POST.')
    void route(req, res)
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

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'
import { runProgram } from './run-program.ts'

const MAX_BYTES = 1024 * 1024 // 1 MB de código
const TIMEOUT_MS = 5000

function sendJson(res: ServerResponse, status: number, body: unknown) {
  if (res.headersSent) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

const fail = (res: ServerResponse, status: number, error: string) => sendJson(res, status, { error })

/** Lê o corpo do pedido. Devolve null (e já respondeu 413) se passar de 1 MB. */
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

/**
 * Executar um programa roda `run` e comandos de verdade neste computador. O
 * servidor só escuta em 127.0.0.1, mas qualquer página aberta no navegador
 * poderia mandar um POST para localhost. Por isso a rota de execução exige:
 *  - Host de localhost (contra DNS rebinding);
 *  - um cabeçalho próprio, que o navegador não deixa um outro site enviar sem
 *    permissão (um POST com cabeçalho personalizado exige um pré-voo CORS, que
 *    este servidor não autoriza);
 *  - Origin igual ao Host, quando o navegador manda um.
 */
function isTrustedRunRequest(req: IncomingMessage): boolean {
  const host = req.headers.host ?? ''
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return false
  if (req.headers['x-flux-run'] !== '1') return false
  const origin = req.headers.origin
  return origin === undefined || origin === `http://${host}`
}

/**
 * Plugin do Vite com a API da interface. Vale para `vite` (dev) e `vite
 * preview`; o servidor escuta só em 127.0.0.1 (ver vite.config.ts).
 *
 *  POST /api/compile[?semantic=1]  roda `../flux --json` com o código e devolve o JSON
 *  POST /api/run                   JSON { source, stdin }: compila, executa e devolve a saída do programa
 */
export function fluxApi(): Plugin {
  let fluxPath = ''

  const compile = async (req: IncomingMessage, res: ServerResponse) => {
    const body = await readBody(req, res)
    if (!body) return
    if (!existsSync(fluxPath)) {
      return fail(res, 503, 'O compilador ./flux não foi encontrado. Rode `make` na raiz do projeto.')
    }

    // ?semantic=1 liga a análise semântica (E1 a E24) do compilador
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
    child.stdin.on('error', () => {}) // o flux pode fechar a entrada antes do fim
    child.on('error', (e) => {
      clearTimeout(timer)
      fail(res, 500, `Não foi possível executar o compilador: ${e.message}`)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      // código 0 = aceito, 1 = rejeitado: nos dois casos há JSON no stdout
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

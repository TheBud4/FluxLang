import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const OUTPUT_LIMIT = 1024 * 1024 // 1 MB de saída por fluxo
const BUILD_TIMEOUT_MS = 30_000
const RUN_TIMEOUT_MS = 10_000

export interface RunResult {
  /** ok: o programa rodou; rejected: não passou na análise; timeout: passou do tempo. */
  status: 'ok' | 'rejected' | 'internal-error' | 'timeout'
  exitCode: number | null
  stdout: string
  stderr: string
  truncated: boolean
  message?: string
}

interface Exec {
  code: number | null
  signal: string | null
  stdout: string
  stderr: string
  timedOut: boolean
  truncated: boolean
}

/**
 * Roda um comando e junta a saída. O processo vira líder de um grupo, para o
 * timeout poder matar também os comandos que o programa FluxLang disparou com
 * `run`. A saída é limitada, mas continua sendo lida (para o processo não travar).
 */
function exec(command: string, args: string[], opts: { input?: string; timeoutMs: number }): Promise<Exec> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: [opts.input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      detached: true,
    })
    const parts: Record<'stdout' | 'stderr', Buffer[]> = { stdout: [], stderr: [] }
    const sizes = { stdout: 0, stderr: 0 }
    let truncated = false
    let timedOut = false

    const collect = (name: 'stdout' | 'stderr') => (chunk: Buffer) => {
      const room = OUTPUT_LIMIT - sizes[name]
      if (room <= 0) {
        truncated = true
        return
      }
      const take = chunk.subarray(0, room)
      parts[name].push(take)
      sizes[name] += take.length
      if (take.length < chunk.length) truncated = true
    }
    child.stdout?.on('data', collect('stdout'))
    child.stderr?.on('data', collect('stderr'))

    const timer = setTimeout(() => {
      timedOut = true
      try {
        if (child.pid) process.kill(-child.pid, 'SIGKILL')
      } catch {
        child.kill('SIGKILL')
      }
    }, opts.timeoutMs)

    const finish = (code: number | null, signal: string | null) => {
      clearTimeout(timer)
      resolve({
        code,
        signal,
        stdout: Buffer.concat(parts.stdout).toString('utf8'),
        stderr: Buffer.concat(parts.stderr).toString('utf8'),
        timedOut,
        truncated,
      })
    }
    child.on('error', (e) => {
      parts.stderr.push(Buffer.from(e.message))
      finish(null, null)
    })
    child.on('close', finish)

    if (opts.input !== undefined) {
      child.stdin?.on('error', () => {})
      child.stdin?.end(opts.input)
    }
  })
}

/**
 * Compila o código com `flux --build` (que já confere a análise semântica) e
 * roda o executável, sem entrada. O código vem do navegador e o programa roda
 * neste computador, com os comandos que ele pedir em `run`: quem chama tem de
 * ter conferido que o pedido veio da própria interface (ver flux-api.ts).
 */
export async function runProgram(fluxPath: string, source: string): Promise<RunResult> {
  const dir = await mkdtemp(path.join(tmpdir(), 'flux-web-'))
  const exe = path.join(dir, 'programa')
  try {
    const build = await exec(fluxPath, ['--build', '-o', exe], { input: source, timeoutMs: BUILD_TIMEOUT_MS })
    const none = { exitCode: null, stdout: '', stderr: '', truncated: false }
    if (build.timedOut) {
      return { ...none, status: 'internal-error', message: 'A compilação demorou mais de 30 segundos.' }
    }
    if (build.code === 1) {
      return { ...none, status: 'rejected', stderr: build.stderr.trim() }
    }
    if (build.code !== 0) {
      return {
        ...none,
        status: 'internal-error',
        message: build.stderr.trim() || `O compilador terminou com código ${build.code}.`,
      }
    }

    const run = await exec(exe, [], { timeoutMs: RUN_TIMEOUT_MS })
    return {
      status: run.timedOut ? 'timeout' : 'ok',
      exitCode: run.code,
      stdout: run.stdout,
      stderr: run.stderr,
      truncated: run.truncated,
      message: run.signal && !run.timedOut ? `O programa foi encerrado pelo sinal ${run.signal}.` : undefined,
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

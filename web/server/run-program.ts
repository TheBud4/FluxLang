import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const OUTPUT_LIMIT = 1024 * 1024
const BUILD_TIMEOUT_MS = 30_000
const RUN_TIMEOUT_MS = 10_000

export type OutputKind = 'log' | 'info' | 'warn' | 'error' | 'fatal' | 'prompt' | 'answer' | 'raw' | 'stderr'

export interface OutputLine {
  kind: OutputKind
  text: string
}

export interface RunResult {
  status: 'ok' | 'rejected' | 'internal-error' | 'timeout'
  exitCode: number | null
  output: OutputLine[]
  truncated: boolean
  message?: string
}

interface Exec {
  code: number | null
  signal: string | null
  stdout: Buffer
  stderr: Buffer
  timedOut: boolean
  truncated: boolean
}

const KINDS: Record<string, OutputKind> = {
  L: 'log',
  I: 'info',
  W: 'warn',
  E: 'error',
  F: 'fatal',
  P: 'prompt',
  A: 'answer',
}

export function parseTagged(buf: Buffer): OutputLine[] {
  const lines: OutputLine[] = []
  let i = 0
  while (i < buf.length) {
    if (buf[i] !== 0x1e) {
      const next = buf.indexOf(0x1e, i)
      const end = next < 0 ? buf.length : next
      lines.push({ kind: 'raw', text: buf.subarray(i, end).toString('utf8') })
      i = end
      continue
    }
    const kind = KINDS[String.fromCharCode(buf[i + 1])]
    const colon = buf.indexOf(0x3a, i + 2)
    const size = colon < 0 ? NaN : Number(buf.subarray(i + 2, colon).toString('ascii'))
    if (!kind || !Number.isInteger(size) || size < 0) {
      i += 1
      continue
    }
    const start = colon + 1
    lines.push({ kind, text: buf.subarray(start, Math.min(start + size, buf.length)).toString('utf8') })
    i = start + size
  }
  return lines
}

function exec(
  command: string,
  args: string[],
  opts: { input?: string; timeoutMs: number; env?: NodeJS.ProcessEnv },
): Promise<Exec> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: [opts.input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      detached: true,
      env: opts.env ?? process.env,
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
        stdout: Buffer.concat(parts.stdout),
        stderr: Buffer.concat(parts.stderr),
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

export async function runProgram(fluxPath: string, source: string, stdin = ''): Promise<RunResult> {
  const dir = await mkdtemp(path.join(tmpdir(), 'flux-web-'))
  const exe = path.join(dir, 'programa')
  try {
    const build = await exec(fluxPath, ['--build', '-o', exe], { input: source, timeoutMs: BUILD_TIMEOUT_MS })
    const none = { exitCode: null, output: [], truncated: false }
    const buildErrors = build.stderr.toString('utf8').trim()
    if (build.timedOut) {
      return { ...none, status: 'internal-error', message: 'A compilação demorou mais de 30 segundos.' }
    }
    if (build.code === 1) {
      return { ...none, status: 'rejected', message: buildErrors }
    }
    if (build.code !== 0) {
      return {
        ...none,
        status: 'internal-error',
        message: buildErrors || `O compilador terminou com código ${build.code}.`,
      }
    }

    const run = await exec(exe, [], {
      input: stdin,
      timeoutMs: RUN_TIMEOUT_MS,
      env: { ...process.env, FLUX_TAGGED: '1' },
    })
    const output = parseTagged(run.stdout)
    const stderr = run.stderr.toString('utf8').trimEnd()
    if (stderr) output.push({ kind: 'stderr', text: stderr })
    return {
      status: run.timedOut ? 'timeout' : 'ok',
      exitCode: run.code,
      output,
      truncated: run.truncated,
      message: run.signal && !run.timedOut ? `O programa foi encerrado pelo sinal ${run.signal}.` : undefined,
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

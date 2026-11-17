export type NodeKind = 'rule' | 'token' | 'empty' | 'error'

export interface TreeNode {
  kind: NodeKind
  label: string
  text?: string
  line?: number
  column?: number
  children?: TreeNode[]
}

export interface Token {
  line: number
  column: number
  type: string
  text: string
}

export interface CompileError {
  kind: 'léxico' | 'sintático' | 'semântico'
  line: number
  column: number
  message: string
}

export interface CompileResult {
  accepted: boolean
  lines: number
  tokens: Token[]
  errors: CompileError[]
  tree: TreeNode | null
}

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

export interface Focus {
  line: number
  column: number
  length?: number
  nonce: number
}

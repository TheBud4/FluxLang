// Formato do `./flux --json` (ver README, seção 9).

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

/** Quem imprimiu a linha: terminal.log/info/warn/error, um erro de execução (fatal) ou o prompt do input. */
export type OutputKind = 'log' | 'info' | 'warn' | 'error' | 'fatal' | 'prompt' | 'raw' | 'stderr'

export interface OutputLine {
  kind: OutputKind
  text: string
}

/** O que `POST /api/run` devolve: a saída do programa FluxLang executado. */
export interface RunResult {
  /** ok: rodou; rejected: não passou na análise; timeout: passou do tempo. */
  status: 'ok' | 'rejected' | 'internal-error' | 'timeout'
  exitCode: number | null
  /** A saída, em ordem, cada linha com o tipo de quem a imprimiu. */
  output: OutputLine[]
  truncated: boolean
  /** Rejeitado: as mensagens do compilador. Erro interno ou sinal: o motivo. */
  message?: string
}

/** Pedido para o editor ir até um ponto do código (clique em erro, token ou nó). */
export interface Focus {
  line: number
  column: number
  /** Quantos caracteres selecionar; sem isso, seleciona a linha inteira. */
  length?: number
  /** Muda a cada pedido, para repetir o mesmo destino funcionar. */
  nonce: number
}

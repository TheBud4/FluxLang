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

/** Pedido para o editor ir até um ponto do código (clique em erro, token ou nó). */
export interface Focus {
  line: number
  column: number
  /** Quantos caracteres selecionar; sem isso, seleciona a linha inteira. */
  length?: number
  /** Muda a cada pedido, para repetir o mesmo destino funcionar. */
  nonce: number
}

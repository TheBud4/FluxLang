import type { TreeNode } from './types'

/**
 * Os não-terminais criados na fatoração LL(1) para tirar a recursão à
 * esquerda: `or_rest`, `expression_list_rest`, `list_after_comma`...
 */
export const isRestNode = (node: TreeNode): boolean =>
  node.kind === 'rule' && (node.label.endsWith('_rest') || node.label.endsWith('_after_comma'))

/**
 * Versão compacta da árvore: remove os nós `*_rest`, sobe os filhos deles para
 * o pai (então `or_expr` fica com `and_expr OR and_expr ...` em fila) e
 * esconde as folhas ε. Devolve uma lista porque um nó removido pode virar
 * vários irmãos.
 */
export function collapseRest(node: TreeNode): TreeNode[] {
  if (node.kind === 'empty') return []
  const children = (node.children ?? []).flatMap(collapseRest)
  if (isRestNode(node)) return children
  return [{ ...node, children: children.length > 0 ? children : undefined }]
}

/** Conta os nós, para mostrar o tamanho da árvore. */
export function countNodes(node: TreeNode): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countNodes(child), 0)
}

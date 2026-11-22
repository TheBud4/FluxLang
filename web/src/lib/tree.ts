import type { TreeNode } from './types'

export const isRestNode = (node: TreeNode): boolean =>
  node.kind === 'rule' && (node.label.endsWith('_rest') || node.label.endsWith('_after_comma'))

export function collapseRest(node: TreeNode): TreeNode[] {
  if (node.kind === 'empty') return []
  const children = (node.children ?? []).flatMap(collapseRest)
  if (isRestNode(node)) return children
  return [{ ...node, children: children.length > 0 ? children : undefined }]
}

export function countNodes(node: TreeNode): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countNodes(child), 0)
}

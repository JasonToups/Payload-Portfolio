import type { Post } from '@/payload-types'

interface LexicalNode {
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

function countWords(node: LexicalNode): number {
  if (typeof node.text === 'string' && node.text.trim()) {
    return node.text.trim().split(/\s+/).filter(Boolean).length
  }
  if (Array.isArray(node.children)) {
    return node.children.reduce((sum, child) => sum + countWords(child as LexicalNode), 0)
  }
  return 0
}

export function getReadMinutes(content: Post['content']): number {
  const words = countWords(content.root as unknown as LexicalNode)
  return Math.max(1, Math.round(words / 250))
}

export function formatPostDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}.${dd}.${yy}`
}

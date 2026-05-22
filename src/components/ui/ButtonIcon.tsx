import React from 'react'
import { ArrowRight, ArrowUpRight, CaretRight, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import {
  ExternalLink,
  Send,
  Mail,
  Download,
  Plus,
  Check,
  type LucideProps,
} from 'lucide-react'

type LucideIconComponent = React.FC<LucideProps>

type PhosphorIconComponent = typeof ArrowRight

const phosphorIconMap: Record<string, PhosphorIconComponent> = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'chevron-right': CaretRight,
  'magnifying-glass': MagnifyingGlass,
}

const lucideIconMap: Record<string, LucideIconComponent> = {
  'external-link': ExternalLink,
  send: Send,
  mail: Mail,
  download: Download,
  plus: Plus,
  check: Check,
}

interface ButtonIconProps {
  name: string | null | undefined
  size?: number
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({ name, size = 16 }) => {
  if (!name || name === 'none') return null
  const PhosphorIcon = phosphorIconMap[name]
  if (PhosphorIcon) return <PhosphorIcon size={size} aria-hidden="true" />
  const LucideIcon = lucideIconMap[name]
  if (LucideIcon) return <LucideIcon size={size} aria-hidden="true" />
  return null
}

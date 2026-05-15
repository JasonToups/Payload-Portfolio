import React from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Send,
  Mail,
  Download,
  Plus,
  Check,
  type LucideProps,
} from 'lucide-react'

type LucideIconComponent = React.FC<LucideProps>

const iconMap: Record<string, LucideIconComponent> = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'chevron-right': ChevronRight,
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
  const Icon = iconMap[name]
  if (!Icon) return null
  return <Icon size={size} aria-hidden="true" />
}

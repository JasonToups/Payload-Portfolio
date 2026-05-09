'use client'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Keyword } from '@/payload-types'

export const KeywordPill: React.FC<{
  keyword: Keyword
  className?: string
}> = ({ keyword, className }) => {
  const slug = keyword.name.replace(/\s+/g, '-')

  return (
    <Link
      href={`/keywords/${slug}`}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-md font-medium bg-primary/10 text-primary-on-bg hover:bg-primary/20 transition-colors',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {keyword.name}
    </Link>
  )
}

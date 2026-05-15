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
        'inline-flex items-center px-2 py-1 rounded-full text-base font-light transition-colors',
        'bg-primary-bright/35 text-primary-dark hover:bg-primary-pale',
        'dark:bg-primary-mid/35 dark:text-primary-pale dark:hover:bg-neutral-50 dark:hover:text-neutral-950',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {keyword.name}
    </Link>
  )
}

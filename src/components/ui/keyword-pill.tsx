'use client'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Keyword } from '@/payload-types'

const pillClass =
  'inline-flex items-center px-2 py-1 rounded-full text-base font-light dark:font-medium transition-[colors,box-shadow] bg-primary-bright/35 text-primary-dark dark:bg-primary-mid/35 dark:text-primary-pale'

export const KeywordPill: React.FC<{
  keyword: Keyword
  className?: string
  presentational?: boolean
}> = ({ keyword, className, presentational = false }) => {
  if (presentational) {
    return (
      <span className={cn(pillClass, className)}>
        {keyword.name}
      </span>
    )
  }

  const slug = keyword.name.replace(/\s+/g, '-')

  return (
    <Link
      href={`/keywords/${slug}`}
      className={cn(
        pillClass,
        'hover:bg-primary-pale hover:shadow-[1px_1px_0px_0px_#a19e9b]',
        'dark:hover:bg-neutral-50 dark:hover:text-neutral-950 dark:hover:shadow-[1px_1px_0px_0px_#a19e9b]',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {keyword.name}
    </Link>
  )
}

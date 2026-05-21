import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'

type PostCardMinimalData = Pick<Post, 'id' | 'slug' | 'meta' | 'title' | 'keywords'>

interface PostCardMinimalProps {
  className?: string
  doc?: PostCardMinimalData
  relationTo?: 'posts'
}

export const PostCardMinimal: React.FC<PostCardMinimalProps> = ({
  className,
  doc,
  relationTo = 'posts',
}) => {
  const { slug, keywords, meta, title } = doc || {}
  const { description } = meta || {}

  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[20px]',
        'border-2 border-[#bb97d8]',
        'bg-white dark:bg-[#060403]',
        'flex flex-col justify-around gap-[6px] p-[30px]',
        className,
      )}
    >
      {/* Full-card overlay link */}
      <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />

      {/* Keywords (presentational, no navigation) */}
      {hasKeywords && (
        <div className="relative z-20 flex flex-wrap gap-x-1.5 gap-y-[11px]">
          {keywords!.map((kw) =>
            typeof kw === 'object' ? (
              <KeywordPill key={kw.id} keyword={kw} presentational />
            ) : null,
          )}
        </div>
      )}

      {/* Title + Description */}
      <div className="flex flex-col gap-[6px]">
        {title && (
          <h3
            className={cn(
              'font-display text-[22px] leading-[1.2] font-normal',
              'text-[#1d1b19] dark:text-[#f8f4f1]',
            )}
          >
            <Link
              className="not-prose no-underline relative z-20"
              href={href}
              style={{ color: 'inherit' }}
            >
              {title}
            </Link>
          </h3>
        )}
        {sanitizedDescription && (
          <p className="text-[15px] leading-[1.55] text-muted-foreground dark:text-[#f4f1ee]">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </article>
  )
}

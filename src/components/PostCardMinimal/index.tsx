import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'

type PostCardMinimalData = Pick<Post, 'slug' | 'meta' | 'title' | 'keywords'>

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
        'post-card relative overflow-hidden bg-white dark:bg-card',
        'flex flex-col justify-around px-[10px] py-[6px] gap-[6px]',
        className,
      )}
    >
      {/* Full-card overlay link — keyboard users navigate via the title link below */}
      <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />

      {/* Title + Description */}
      <div className="flex flex-col gap-[6px]">
        {title && (
          <h3 className="font-display text-[1.375rem] leading-[1.2] font-semibold text-foreground">
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
          <p className="text-[15px] leading-[1.55] text-muted-foreground dark:text-foreground">
            {sanitizedDescription}
          </p>
        )}
      </div>

      {/* Keywords */}
      {hasKeywords && (
        <div className="relative z-20 flex flex-wrap gap-x-1.5 gap-y-[11px]">
          {keywords!.map((kw) =>
            typeof kw === 'object' ? <KeywordPill key={kw.id} keyword={kw} /> : null,
          )}
        </div>
      )}
    </article>
  )
}

import Link from 'next/link'
import React from 'react'

import type { CardPostData } from '@/components/Card'
import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'
import { formatPostDate, getReadMinutes } from '@/utilities/postMeta'

interface PostCardFeaturedProps {
  className?: string
  doc?: CardPostData
  index?: number
  relationTo?: 'posts'
  showCategories?: boolean
}

export const PostCardFeatured: React.FC<PostCardFeaturedProps> = ({
  className,
  doc,
  relationTo = 'posts',
  showCategories,
}) => {
  const { slug, categories, keywords, meta, title, publishedAt, content } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`
  const readMinutes = content ? getReadMinutes(content) : 1
  const formattedDate = formatPostDate(publishedAt)

  return (
    <article
      className={cn(
        'post-card relative overflow-hidden rounded-[6px] bg-card',
        'flex flex-row gap-4 p-4',
        className,
      )}
    >
      {/* Full-card overlay link — keyboard users navigate via the title link below */}
      <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-around h-[304px]">
        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {showCategories &&
              hasCategories &&
              categories?.map((category, i) =>
                typeof category === 'object' ? (
                  <span key={i} className="tag text-base truncate">
                    {category.title || 'Untitled'}
                  </span>
                ) : null,
              )}
          </div>
          {formattedDate && (
            <span className="font-mono text-[12px] text-muted-foreground tracking-[1px] whitespace-nowrap shrink-0">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Title + Description */}
        <div className="flex flex-col gap-[6px]">
          {title && (
            <h2 className="font-display text-[1.375rem] leading-[1.2] font-semibold text-foreground">
              <Link
                className="not-prose no-underline relative z-20"
                href={href}
                style={{ color: 'inherit' }}
              >
                {title}
              </Link>
            </h2>
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

        {/* Separator */}
        <div className="border-t border-border w-full" role="separator" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] text-muted-foreground tracking-[1px]">
            {readMinutes} MIN READ
          </span>
          <span className="text-primary-base dark:text-primary-pale" aria-hidden="true">
            →
          </span>
        </div>
      </div>
      {/* Thumb */}
      <div className="relative w-[405px] h-[304px] shrink-0 bg-[#2e2c2a] overflow-hidden">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            resource={metaImage}
            size="405px"
            imgClassName="absolute inset-0 w-full h-full object-cover object-center"
            fill
          />
        )}
      </div>
    </article>
  )
}

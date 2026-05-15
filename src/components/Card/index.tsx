import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'
import { getReadMinutes, formatPostDate } from '@/utilities/postMeta'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'keywords' | 'publishedAt'
> &
  Partial<Pick<Post, 'content'>>

export const Card: React.FC<{
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
  index?: number
}> = (props) => {
  const { className, doc, relationTo, showCategories, title: titleFromProps, index = 0 } = props

  const { slug, categories, keywords, meta, title, publishedAt, content } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`
  const readMinutes = content ? getReadMinutes(content) : 1
  const formattedDate = formatPostDate(publishedAt)
  const cardNumber = `NO. ${String(index + 1).padStart(2, '0')}`

  return (
    <article
      className={cn(
        'post-card relative overflow-hidden rounded-[6px] bg-card',
        'flex flex-row items-center',
        'md:flex-col md:items-stretch',
        className,
      )}
    >
      {/* Full-card overlay link — keyboard users navigate via the title link below */}
      <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />

      {/* Thumbnail */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-[#2e2c2a]',
          'w-28 h-28',
          'md:w-full md:h-[304px] md:rounded-t-[6px] md:rounded-b-none',
        )}
      >
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            resource={metaImage}
            size="33vw"
            imgClassName="absolute inset-0 w-full h-full object-cover object-center"
            fill
          />
        )}

        {/* Badge — desktop only, overlaid top-left on thumbnail */}
        <div className="hidden md:block absolute top-4 left-4 z-[1]">
          <span
            className={cn(
              'font-mono text-base tracking-[0.1em]',
              'px-2 py-1 rounded-[4px]',
              'bg-card/85 backdrop-blur-sm text-foreground',
            )}
          >
            {cardNumber}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div
        className={cn(
          'flex-1 min-w-0 px-4 py-3',
          'md:px-5 md:pt-4 md:pb-5',
          'flex flex-col gap-[6px]',
        )}
      >
        {/* Meta — categories left, date right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 relative z-20">
            {/* Mobile card number */}
            <span className="font-mono text-base text-primary-on-bg tracking-[0.08em] shrink-0 md:hidden">
              {cardNumber} /
            </span>
            {showCategories && hasCategories &&
              categories?.map((category, i) =>
                typeof category === 'object' ? (
                  <span key={i} className="tag truncate">
                    {category.title || 'Untitled'}
                  </span>
                ) : null,
              )}
          </div>
          {formattedDate && (
            <span className="font-mono text-base text-muted-foreground tracking-[0.05em] whitespace-nowrap shrink-0">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Title + Description */}
        <div className="flex flex-col gap-[6px]">
          {titleToUse && (
            <h3
              className="font-display text-[1.375rem] leading-[1.2] font-semibold text-foreground"
            >
              <Link className="not-prose no-underline relative z-20" href={href} style={{ color: 'inherit' }}>
                {titleToUse}
              </Link>
            </h3>
          )}
          {sanitizedDescription && (
            <p className="text-base leading-[1.55] text-muted-foreground">
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
          <span className="font-mono text-base text-muted-foreground tracking-[0.05em]">
            {readMinutes} MIN READ
          </span>
          <span className="text-primary" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </article>
  )
}

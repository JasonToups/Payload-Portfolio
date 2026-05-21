import Link from 'next/link'
import React from 'react'

import type { CardPostData } from '@/components/Card'
import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'
import { formatPostDate, getReadMinutes } from '@/utilities/postMeta'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'

interface PostCardFeaturedProps {
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
}

export const PostCardFeatured: React.FC<PostCardFeaturedProps> = ({
  className,
  doc,
  relationTo = 'posts',
}) => {
  const { slug, keywords, meta, title, publishedAt, content } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`
  const readMinutes = content ? getReadMinutes(content) : 1
  const formattedDate = formatPostDate(publishedAt)

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[6px]',
        'flex flex-col gap-4 p-4 w-full',
        className,
      )}
    >
      {/* Full-card overlay link */}
      <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />

      {/* Image */}
      <div className="relative w-[627px] h-[421px] shrink-0 bg-[#2e2c2a] rounded-[15px] overflow-hidden">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            resource={metaImage}
            size="627px"
            imgClassName="absolute inset-0 w-full h-full object-cover object-center"
            fill
          />
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-[13px]">
        {/* Meta — date */}
        <div className="flex items-center justify-end">
          {formattedDate && (
            <span className="font-mono text-[12px] text-muted-foreground tracking-[1px] whitespace-nowrap">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Title + Description */}
        <div className="flex flex-col gap-[6px]">
          {title && (
            <h2 className="font-display text-[22px] leading-[1.2] font-normal text-[#1d1b19] dark:text-foreground">
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
            <p className="text-[15px] leading-[1.55] text-muted-foreground">
              {sanitizedDescription}
            </p>
          )}
        </div>

        {/* Keywords (presentational) */}
        {hasKeywords && (
          <div className="relative z-20 flex flex-wrap gap-x-1.5 gap-y-[11px] mb-[15px]">
            {keywords!.map((kw) =>
              typeof kw === 'object' ? (
                <KeywordPill key={kw.id} keyword={kw} presentational />
              ) : null,
            )}
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-border w-full" role="separator" />

        {/* Footer */}
        <div className="flex items-center justify-between my-[10px]">
          <span className="font-mono text-[12px] text-muted-foreground tracking-[1px]">
            {readMinutes} MIN READ
          </span>
          <ArrowRight size={24} className="text-primary-base dark:text-primary-pale" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}

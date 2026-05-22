import Link from 'next/link'
import React from 'react'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'

import type { CardPostData } from '@/components/Card'
import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'
import { getReadMinutes } from '@/utilities/postMeta'

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
  const { slug, keywords, meta, title, content } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`
  const readMinutes = content ? getReadMinutes(content) : 1

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[6px]',
        'flex flex-col w-full p-4 gap-4',
        className,
      )}
    >
      {/* Full-card overlay link */}
      <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />

      {/* Image — 627×421 aspect ratio */}
      <div className="relative overflow-hidden rounded-[15px] aspect-video">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            resource={metaImage}
            fill
            imgClassName="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-7">
        {/* Title + Description */}
        <div className="flex flex-col gap-[6px]">
          {title && (
            <h2 className="font-sans text-[22px] leading-[1.2] font-normal text-foreground">
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
          <div className="relative z-20 flex flex-wrap gap-x-[6px] gap-y-[11px]">
            {keywords!.map((kw) =>
              typeof kw === 'object' ? <KeywordPill key={kw.id} keyword={kw} /> : null,
            )}
          </div>
        )}

        {/* Dotted separator */}
        <div
          className="hidden md:block w-full border-t-[3px] border-dotted border-border"
          role="separator"
        />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] text-muted-foreground tracking-[1px]">
            {readMinutes} MIN READ
          </span>
          <ArrowRight size={24} className="text-primary-base" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}

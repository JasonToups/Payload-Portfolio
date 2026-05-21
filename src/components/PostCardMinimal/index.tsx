import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'
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
        'relative overflow-hidden bg-white dark:bg-card',
        'flex flex-col w-full',
        className,
      )}
    >
      {/* Full-card overlay link */}
      <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />

      {/* Card Body Content — padding 8px, gap 6.2px */}
      <div className="flex flex-col justify-around gap-[6.2px] p-[8px] w-full">
        {/* Title + Description */}
        <div className="flex flex-col gap-[6px]">
          {title && (
            <h3 className="font-sans text-[22px] leading-[1.2] font-normal text-foreground">
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

        {/* Keywords — right-aligned, no pill background */}
        {hasKeywords && (
          <div className="relative z-20 flex flex-wrap justify-end gap-x-[6px] gap-y-[11px]">
            {keywords!.map((kw) =>
              typeof kw === 'object' ? (
                <span
                  key={kw.id}
                  className="inline-flex items-center text-base font-light lowercase text-primary-dark dark:text-primary-pale"
                >
                  {kw.name}
                </span>
              ) : null,
            )}
          </div>
        )}
      </div>
    </article>
  )
}

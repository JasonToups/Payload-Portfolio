import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { formatAuthors } from '@/utilities/formatAuthors'
import { getReadMinutes, formatPostDate } from '@/utilities/postMeta'

export const PostHero: React.FC<{ post: Post }> = ({ post }) => {
  const { categories, heroImage, keywords, populatedAuthors, publishedAt, title, content } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''
  const formattedDate = formatPostDate(publishedAt)
  const readMinutes = getReadMinutes(content)
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const hasImage = heroImage && typeof heroImage !== 'string'

  return (
    <div className="relative mt-1">
      <div className="container">
        {/* Image cropped to a fixed height — overflow clipped, rounded corners */}
        <div className="relative overflow-hidden rounded-lg" style={{ height: '28rem' }}>
          {hasImage ? (
            <>
              <Media
                resource={heroImage}
                priority
                fill
                size="100vw"
                imgClassName="object-cover object-center"
              />
              {/* Gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="post-thumb absolute inset-0" />
          )}

          {/* Text content — pinned to bottom of the image */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="pb-8 px-8 lg:grid lg:grid-cols-[1fr_48rem_1fr]">
              <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
                {/* Categories as .tag pills */}
                {hasCategories && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {categories!.map((category, i) => {
                      if (typeof category !== 'object' || !category) return null
                      return (
                        <span key={i} className="tag" style={{ color: 'var(--primary-on-bg)' }}>
                          {category.title || 'Untitled'}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-headline text-white mb-5">{title}</h1>

                {/* Compact monospace meta row */}
                <div
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono"
                  style={{
                    fontSize: '0.8125rem',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {formattedDate && <span>{formattedDate}</span>}
                  {formattedDate && <span aria-hidden="true">·</span>}
                  <span>{readMinutes} MIN READ</span>
                  {hasAuthors && <span aria-hidden="true">·</span>}
                  {hasAuthors && <span>{formatAuthors(populatedAuthors)}</span>}
                </div>

                {/* Keyword pills */}
                {hasKeywords && (
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {keywords!.map((kw) =>
                      typeof kw === 'object' ? <KeywordPill key={kw.id} keyword={kw} /> : null,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

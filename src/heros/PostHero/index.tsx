import React from 'react'
import Link from 'next/link'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'
import { formatAuthors } from '@/utilities/formatAuthors'
import { getReadMinutes, formatPostDate } from '@/utilities/postMeta'

export const PostHero: React.FC<{ post: Post }> = ({ post }) => {
  const {
    categories,
    heroImage,
    postDescription,
    keywords,
    populatedAuthors,
    publishedAt,
    title,
    content,
  } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''
  const formattedDate = formatPostDate(publishedAt)
  const readMinutes = getReadMinutes(content)
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const hasImage = heroImage && typeof heroImage !== 'string'
  const description = postDescription

  return (
    <section className="relative overflow-hidden bg-post">
      {/* Blurred backdrop — desktop: frosted photo shows through; mobile: full-white overlay hides it */}
      {hasImage && (
        <div className="absolute inset-0" aria-hidden="true">
          <Media
            resource={heroImage}
            fill
            imgClassName="object-cover object-center blur-[18px] scale-110"
          />
          <div className="absolute inset-0 bg-post md:bg-post/80 dark:md:bg-post/90" />
        </div>
      )}

      <div className="relative z-10 pt-15 pb-7.5 md:pt-25 md:pb-15">
        <div className="flex flex-col gap-5 px-5 md:flex-row md:justify-around md:items-center">
          {/* Content block */}
          <div
            className={cn(
              'flex flex-col justify-between overflow-hidden gap-5.25 px-5 md:px-0 py-6.5 pb-10 md:w-160 md:h-full md:gap-3.5 md:pb-6.5',
            )}
          >
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 font-mono text-base text-primary-mid">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">&gt;</li>
                <li>
                  <Link href="/posts" className="hover:underline">
                    Post
                  </Link>
                </li>
                {hasCategories &&
                  categories!.slice(0, 1).map((cat) => {
                    if (typeof cat !== 'object' || !cat) return null
                    return (
                      <React.Fragment key={cat.id}>
                        <li aria-hidden="true">/</li>
                        <li className="uppercase">{cat.title}</li>
                      </React.Fragment>
                    )
                  })}
              </ol>
            </nav>

            {/* Title */}
            <h1 className="font-['Spectral'] text-4xl md:text-[48px] font-semibold leading-[1.1] text-foreground">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="font-sans text-l md:text-xl font-normal leading-relaxed text-foreground">
                {description}
              </p>
            )}
            {/* Keywords */}
            {hasKeywords && (
              <div className="flex flex-wrap gap-5 justify-end md:justify-start py-3 md:py-6">
                {keywords!.map((kw) =>
                  typeof kw === 'object' ? <KeywordPill key={kw.id} keyword={kw} /> : null,
                )}
              </div>
            )}

            {/* Meta */}
            <div
              className={cn(
                'flex flex-wrap items-center gap-x-2.5 font-mono text-md tracking-[1px] text-foreground/60 justify-end md:justify-start',
              )}
            >
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && <span aria-hidden="true">·</span>}
              <span>{readMinutes} MIN READ</span>
              {hasAuthors && <span aria-hidden="true">·</span>}
              {hasAuthors && <span>{formatAuthors(populatedAuthors!)}</span>}
            </div>
          </div>

          {/* Hero image — stacks below content on mobile, floats right on desktop */}
          {hasImage && (
            <div className="overflow-hidden shrink w-full md:w-170 md:rounded-lg">
              <Media resource={heroImage} priority imgClassName="w-full h-auto block" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

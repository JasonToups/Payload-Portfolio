import React from 'react'
import Link from 'next/link'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'
import { cn } from '@/utilities/ui'
import { formatAuthors } from '@/utilities/formatAuthors'
import { getReadMinutes, formatPostDate } from '@/utilities/postMeta'

export const PostHero: React.FC<{ post: Post }> = ({ post }) => {
  const { categories, heroImage, keywords, populatedAuthors, publishedAt, title, content, meta } =
    post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''
  const formattedDate = formatPostDate(publishedAt)
  const readMinutes = getReadMinutes(content)
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const hasImage = heroImage && typeof heroImage !== 'string'
  const description = meta?.description

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Blurred backdrop — desktop: frosted photo shows through; mobile: full-white overlay hides it */}
      {hasImage && (
        <div className="absolute inset-0" aria-hidden="true">
          <Media
            resource={heroImage}
            fill
            imgClassName="object-cover object-center blur-[18px] scale-110"
          />
          <div className="absolute inset-0 bg-white dark:bg-background md:bg-white/80 dark:md:bg-background/80" />
        </div>
      )}

      <div className="container relative z-10 py-[26px] md:py-[71px]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          {/* Content block */}
          <div
            className={cn(
              'flex flex-col justify-between overflow-hidden',
              'gap-[21px] px-5 py-[26px] pb-[40px]',
              'md:w-[570px] md:h-[405px] md:gap-[14px] md:pb-[26px]',
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
            <h1 className="font-['Spectral'] text-[48px] font-semibold leading-[1.1] text-foreground">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="font-['Plus_Jakarta_Sans'] text-[24px] font-normal leading-[1.1] text-foreground">
                {description}
              </p>
            )}

            {/* Meta */}
            <div
              className={cn(
                'flex flex-wrap items-center gap-x-[10px]',
                'font-mono text-[18px] tracking-[1px] text-foreground/60',
                'justify-center md:justify-start',
              )}
            >
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && <span aria-hidden="true">·</span>}
              <span>{readMinutes} MIN READ</span>
              {hasAuthors && <span aria-hidden="true">·</span>}
              {hasAuthors && <span>{formatAuthors(populatedAuthors!)}</span>}
            </div>

            {/* Keywords */}
            {hasKeywords && (
              <div className="flex flex-wrap gap-2">
                {keywords!.map((kw) =>
                  typeof kw === 'object' ? <KeywordPill key={kw.id} keyword={kw} /> : null,
                )}
              </div>
            )}
          </div>

          {/* Hero image — stacks below content on mobile, floats right on desktop */}
          {hasImage && (
            <div
              className={cn(
                'relative overflow-hidden flex-shrink-0',
                'w-full h-[283px]',
                'md:w-[679px] md:h-[405px] md:rounded-lg',
              )}
            >
              <Media
                resource={heroImage}
                priority
                fill
                imgClassName="object-cover object-center"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

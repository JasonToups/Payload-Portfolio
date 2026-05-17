import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'

import { CollectionArchive } from '@/components/CollectionArchive'
import { getPostsByFilters } from '@/utilities/getPostsByFilters'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    eyebrow,
    heading,
    categories,
    keywords,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
  } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = categories?.map((category) =>
      typeof category === 'object' ? category.id : category,
    )

    const flattenedKeywords = keywords?.map((keyword) =>
      typeof keyword === 'object' ? keyword.id : keyword,
    )

    posts = await getPostsByFilters({
      categoryIds: flattenedCategories ?? [],
      keywordIds: flattenedKeywords ?? [],
      limit,
    })
  } else {
    if (selectedDocs?.length) {
      posts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]
    }
  }

  return (
    <section className="md:px-12 py-24" id={`block-${id}`}>
      <div className="px-6 flex justify-between items-baseline mb-12">
        <div>
          {eyebrow && (
            <span
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--primary-on-bg)',
              }}
            >
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="text-headline" style={{ marginTop: '1rem' }}>
              {heading}
            </h2>
          )}
        </div>
        <Link
          href="/posts"
          className="font-mono flex items-center gap-1.5"
          style={{ fontSize: '0.875rem', color: 'var(--foreground)', textDecoration: 'none' }}
        >
          ALL POSTS <ArrowRight size={21} aria-hidden="true" />
        </Link>
      </div>
      <div className="px-1 md:px-0">
        <CollectionArchive posts={posts} />
      </div>
    </section>
  )
}

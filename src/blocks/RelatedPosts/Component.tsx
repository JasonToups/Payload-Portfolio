import clsx from 'clsx'
import React from 'react'

import type { Post } from '@/payload-types'

import { Card } from '../../components/Card'
import { PostCardMinimal } from '@/components/PostCardMinimal'

export type RelatedPostDoc = Pick<Post, 'id' | 'slug' | 'meta' | 'title' | 'keywords'> &
  Partial<Pick<Post, 'categories' | 'publishedAt' | 'content'>>

export type RelatedPostsProps = {
  className?: string
  docs?: RelatedPostDoc[]
  layout?: 'grid' | 'sidebar'
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({
  className,
  docs,
  layout = 'grid',
}) => {
  const minimalList = (
    <div className="flex flex-col gap-[21px]">
      {docs?.map((doc, i) => (
        <React.Fragment key={doc.slug}>
          <PostCardMinimal doc={doc} />
          {i < docs.length - 1 && (
            <div className="w-full border-t-2 border-border" role="separator" />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  if (layout === 'sidebar') {
    return <div className={clsx('w-full', className)}>{minimalList}</div>
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className="hidden md:grid grid-cols-3 gap-8">
        {docs?.map((doc, i) => (
          <Card key={i} doc={doc} relationTo="posts" showCategories />
        ))}
      </div>
      <div className="md:hidden">{minimalList}</div>
    </div>
  )
}

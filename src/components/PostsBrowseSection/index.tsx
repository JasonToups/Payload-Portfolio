import React from 'react'

import { BackLink } from '@/components/ui/back-link'
import { PostCardFeatured } from '@/components/PostCardFeatured'
import { PostsSearchToggle } from '@/components/PostsSearchToggle'
import { PostsGrid } from '@/components/PostsGrid'
import { Pagination } from '@/components/Pagination'
import type { CardPostData } from '@/components/Card'

interface PostsBrowseSectionProps {
  backLink?: boolean
  title?: string
  featuredPost?: CardPostData | null
  heading?: string
  basePath: string
  searchQuery: string
  posts: CardPostData[]
  currentPage: number
  totalPages: number
  paginationBasePath: string
  emptyMessage: string
}

export const PostsBrowseSection: React.FC<PostsBrowseSectionProps> = ({
  backLink,
  title,
  featuredPost,
  heading = 'All Posts',
  basePath,
  searchQuery,
  posts,
  currentPage,
  totalPages,
  paginationBasePath,
  emptyMessage,
}) => {
  const isSearching = searchQuery.length > 0

  return (
    <>
      {(backLink || title) && (
        <div className="flex flex-col gap-2">
          {backLink && <BackLink />}
          {title && (
            <h1 className="font-display text-3xl font-semibold text-foreground capitalize">
              {title}
            </h1>
          )}
        </div>
      )}

      {featuredPost && (
        <div className="flex flex-col gap-3">
          <PostCardFeatured doc={featuredPost} />
        </div>
      )}

      <PostsSearchToggle
        heading={heading}
        defaultValue={searchQuery}
        basePath={basePath}
        searchQuery={searchQuery}
      />

      {isSearching ? (
        <div className="flex flex-col gap-8">
          <p className="font-mono text-sm text-muted-foreground">
            Searching for <span className="text-foreground">&ldquo;{searchQuery}&rdquo;</span>
            {posts.length > 0 ? ` — ${posts.length} result${posts.length === 1 ? '' : 's'}` : ''}
          </p>
          {posts.length > 0 ? (
            <PostsGrid posts={posts} />
          ) : (
            <p className="text-muted-foreground">No posts found for &ldquo;{searchQuery}&rdquo;.</p>
          )}
        </div>
      ) : posts.length > 0 ? (
        <PostsGrid posts={posts} />
      ) : (
        <p className="text-muted-foreground">{emptyMessage}</p>
      )}

      {!isSearching && totalPages > 1 && (
        <Pagination basePath={paginationBasePath} page={currentPage} totalPages={totalPages} />
      )}
    </>
  )
}

import React from 'react'

import type { CardPostData } from '@/components/Card'
import { Card } from '@/components/Card'

interface PostsGridProps {
  posts: CardPostData[]
}

export const PostsGrid: React.FC<PostsGridProps> = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 md:gap-10.5">
      {posts.map((post, index) => (
        <Card
          key={post.slug}
          doc={post}
          relationTo="posts"
          showCategories
          index={index}
          priority={index < 3}
        />
      ))}
    </div>
  )
}

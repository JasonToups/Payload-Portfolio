import React from 'react'

import type { CardPostData } from '@/components/Card'
import { Card } from '@/components/Card'

interface PostsGridProps {
  posts: CardPostData[]
}

export const PostsGrid: React.FC<PostsGridProps> = ({ posts }) => {
  const rows: CardPostData[][] = []
  for (let i = 0; i < posts.length; i += 3) {
    rows.push(posts.slice(i, i + 3))
  }

  return (
    <div className="flex flex-col gap-[42px]">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-3 gap-[42px]">
          {row.map((post, colIndex) => (
            <Card
              key={post.slug}
              doc={post}
              relationTo="posts"
              showCategories
              index={rowIndex * 3 + colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

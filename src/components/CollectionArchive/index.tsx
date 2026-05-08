import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {posts?.map((result, index) => {
        if (typeof result === 'object' && result !== null) {
          return (
            <Card key={index} doc={result} relationTo="posts" showCategories index={index} />
          )
        }

        return null
      })}
    </div>
  )
}

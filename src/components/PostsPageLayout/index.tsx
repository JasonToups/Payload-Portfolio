import React from 'react'

import { cn } from '@/utilities/ui'

interface PostsPageLayoutProps {
  children: React.ReactNode
  className?: string
}

export const PostsPageLayout: React.FC<PostsPageLayoutProps> = ({ children, className }) => (
  <div className={cn('flex flex-col gap-15.5 py-20 px-16 bg-post', className)}>
    <div className="flex flex-col max-md:px-1.5 gap-9 md:gap-15">{children}</div>
  </div>
)

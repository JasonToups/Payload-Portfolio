import React from 'react'

import { cn } from '@/utilities/ui'

interface PostsPageLayoutProps {
  children: React.ReactNode
  className?: string
}

export const PostsPageLayout: React.FC<PostsPageLayoutProps> = ({ children, className }) => (
  <div className={cn('flex flex-col gap-[62px] pt-16 pb-16 bg-post', className)}>
    <div className="container flex flex-col gap-[60px]">{children}</div>
  </div>
)

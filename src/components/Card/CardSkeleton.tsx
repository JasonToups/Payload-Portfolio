import React from 'react'

import { cn } from '@/utilities/ui'

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <article
      className={cn('post-card relative overflow-hidden bg-card', 'md:flex md:flex-col', className)}
    >
      {/* Mobile: blurred backdrop placeholder */}
      <div className="bg-[#2e2c2a] overflow-hidden absolute inset-0 md:hidden animate-pulse" />

      {/* Desktop: 16:9 image placeholder */}
      <div className="hidden md:block relative overflow-hidden rounded-[15px] bg-muted aspect-video animate-pulse" />

      {/* Card body */}
      <div className="relative z-20 flex flex-col px-3 py-5 gap-5 md:px-5 md:pt-4 md:pb-5 md:gap-6">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>

        {/* Title + description */}
        <div className="flex flex-col gap-1.5">
          <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
          <div className="mt-1 h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
        </div>

        {/* Separator */}
        <div className="border-t-[3px] border-dotted border-border w-full opacity-30" role="separator" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-6 w-6 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </article>
  )
}

import type { BlockQuoteBlock as BlockQuoteBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'

import RichText from '@/components/RichText'

interface Props {
  className?: string
}

export const BlockQuoteBlock: React.FC<Props & BlockQuoteBlockProps> = ({ className, content }) => {
  return (
    <blockquote
      className={cn(
        'flex flex-row gap-4 overflow-hidden rounded-[6px] bg-neutral-150 p-5 dark:bg-neutral-800',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="w-1 shrink-0 self-stretch rounded-[2px] bg-primary-muted dark:bg-primary-base"
      />
      <div className="flex-1 font-['Plus_Jakarta_Sans'] text-2xl font-medium leading-[1.6] tracking-[0.5px] text-foreground">
        <RichText data={content} enableGutter={false} enableProse={false} />
      </div>
    </blockquote>
  )
}

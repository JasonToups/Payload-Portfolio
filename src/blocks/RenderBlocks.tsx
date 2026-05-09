import React, { Fragment } from 'react'
import dynamic from 'next/dynamic'

import type { Page } from '@/payload-types'

const ArchiveBlock = dynamic(() =>
  import('@/blocks/ArchiveBlock/Component').then((m) => ({ default: m.ArchiveBlock })),
)
const CallToActionBlock = dynamic(() =>
  import('@/blocks/CallToAction/Component').then((m) => ({ default: m.CallToActionBlock })),
)
const ContentBlock = dynamic(() =>
  import('@/blocks/Content/Component').then((m) => ({ default: m.ContentBlock })),
)
const FormBlock = dynamic(() =>
  import('@/blocks/Form/Component').then((m) => ({ default: m.FormBlock })),
)
const MarqueeBlock = dynamic(() =>
  import('@/blocks/Marquee/Component').then((m) => ({ default: m.MarqueeBlock })),
)
const MediaBlock = dynamic(() =>
  import('@/blocks/MediaBlock/Component').then((m) => ({ default: m.MediaBlock })),
)
const ServicesBlock = dynamic(() =>
  import('@/blocks/Services/Component').then((m) => ({ default: m.ServicesBlock })),
)
const SkillsBlock = dynamic(() =>
  import('@/blocks/Skills/Component').then((m) => ({ default: m.SkillsBlock })),
)
const SubscribeBlock = dynamic(() =>
  import('@/blocks/Subscribe/Component').then((m) => ({ default: m.SubscribeBlock })),
)
const TestimonialsBlock = dynamic(() =>
  import('@/blocks/Testimonials/Component').then((m) => ({ default: m.TestimonialsBlock })),
)

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  marquee: MarqueeBlock,
  mediaBlock: MediaBlock,
  services: ServicesBlock,
  skills: SkillsBlock,
  subscribe: SubscribeBlock,
  testimonials: TestimonialsBlock,
}

// Blocks that manage their own section padding — no wrapper margin applied
const fullWidthBlocks = new Set(['marquee', 'services', 'skills', 'subscribe', 'testimonials'])

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]
            const isFullWidth = fullWidthBlocks.has(blockType)

            if (Block) {
              return (
                <div className={isFullWidth ? '' : 'my-16'} key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}

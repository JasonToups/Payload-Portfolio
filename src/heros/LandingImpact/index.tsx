import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

export const LandingImpactHero: React.FC<Page['hero']> = ({ heading, links, richText }) => {
  return (
    <div
      className="section-primary-dark relative -mt-[10.4rem] flex min-h-[80vh] items-center justify-center"
      data-theme="dark"
    >
      <div className="container z-10 flex items-center justify-center py-24">
        <div className="max-w-[48rem] md:text-center">
          {heading && <h1 className="text-display mb-6">{heading}</h1>}
          {richText && <RichText className="mb-8" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap md:justify-center gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

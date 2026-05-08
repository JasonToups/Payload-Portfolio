import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { sizePreviewSlug } from '@payloadcms/ui/elements/Upload'

export const MediumImpactHero: React.FC<Page['hero']> = ({ heading, links, media, richText }) => {
  return (
    <section className="w-full flex justify-center align-center">
      <div className="hero-medium-impact w-full max-w-[50rem] mt-6 mb-10 md:mb-14 md:mt-14 md:my-16 mx-6 md:mx-10 grid grid-cols-2 md:grid-cols-[3fr_2fr] gap-x-8 gap-y-1 md:gap-y-3  items-start">
        {heading && (
          <h1 className="text-display col-start-1 row-start-1 self-center text-center  md:text-left">
            {heading}
          </h1>
        )}

        {media && typeof media === 'object' && (
          <div className="col-start-2 row-start-1 md:row-span-2">
            <Media imgClassName="w-full h-auto" priority resource={media} />
          </div>
        )}

        <div className="col-start-1 col-span-2 md:col-span-1 row-start-2">
          {richText && (
            <RichText className="mb-5 md:mb-7 mt-2" data={richText} enableGutter={true} />
          )}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex justify-end md:justify-start gap-4 ml-16">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} size="lg" className="text-lg" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

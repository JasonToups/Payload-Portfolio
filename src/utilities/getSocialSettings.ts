import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SocialSetting } from '@/payload-types'

export const getSocialSettings = unstable_cache(
  async (): Promise<SocialSetting> => {
    const payload = await getPayload({ config: configPromise })
    return payload.findGlobal({ slug: 'social-settings' })
  },
  ['social-settings'],
  { tags: ['social-settings'] },
)

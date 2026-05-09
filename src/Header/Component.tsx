import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

const getHeaderData = getCachedGlobal('header', 1)

export async function Header() {
  const headerData: Header = await getHeaderData()

  return <HeaderClient data={headerData} />
}

import type { CollectionBeforeChangeHook } from 'payload'

const FOLDER_ID_PATTERN = /\/(?:collections\/media\/payload-folders|browse-by-folder)\/(\d+)/

export const inferFolderFromReferer: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation !== 'create') return data
  if (data.folder) return data

  const referer = req.headers.get('referer') ?? ''
  const match = referer.match(FOLDER_ID_PATTERN)
  if (!match) return data

  return { ...data, folder: parseInt(match[1], 10) }
}

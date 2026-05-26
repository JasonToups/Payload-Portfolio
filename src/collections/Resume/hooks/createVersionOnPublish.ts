import type { CollectionAfterChangeHook } from 'payload'
import type { Resume } from '../../../payload-types'

export const createVersionOnPublish: CollectionAfterChangeHook<Resume> = async ({
  doc,
  previousDoc,
  operation,
  req: { payload, context },
}) => {
  if (operation !== 'update') return doc
  if (context.skipVersionSnapshot) return doc
  if (doc._status !== 'published') return doc
  if (previousDoc._status !== 'published') return doc

  const snapshotTitle = previousDoc.title

  try {
    await payload.create({
      collection: 'resumes',
      draft: true,
      context: { skipVersionSnapshot: true },
      data: {
        title: snapshotTitle,
        author: previousDoc.author,
        content: previousDoc.content,
      },
    })
    payload.logger.info(`[Resume] Archived previous version: "${snapshotTitle}"`)
  } catch (err) {
    payload.logger.error(`[Resume] Failed to archive "${previousDoc.title}": ${String(err)}`)
  }

  return doc
}

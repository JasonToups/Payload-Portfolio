import type { CollectionAfterChangeHook } from 'payload'
import type { Resume } from '../../../payload-types'

export const createVersionOnPublish: CollectionAfterChangeHook<Resume> = async ({
  doc,
  previousDoc: _previousDoc,
  operation,
  req: { payload, context },
}) => {
  if (operation !== 'update') return doc
  if (context.skipVersionSnapshot) return doc
  if (doc._status !== 'published') return doc

  const dateSuffix = doc.updatedAt.slice(0, 10)
  const snapshotTitle = `${doc.title} — ${dateSuffix}`

  try {
    await payload.create({
      collection: 'resumes',
      draft: true,
      context: { skipVersionSnapshot: true },
      data: {
        title: snapshotTitle,
        author: doc.author,
        content: doc.content,
      },
    })
    payload.logger.info(`[Resume] Created snapshot: "${snapshotTitle}"`)
  } catch (err) {
    payload.logger.error(`[Resume] Failed to create snapshot for "${doc.title}": ${String(err)}`)
  }

  return doc
}

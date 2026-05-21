'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

import './index.scss'

const SuccessMessage: React.FC = () => (
  <div>
    50 posts seeded!{' '}
    <a href="/admin/collections/posts" target="_blank">
      View posts in admin
    </a>
  </div>
)

export const SeedPostsButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (seeded) {
        toast.info('Posts already seeded.')
        return
      }
      if (loading) {
        toast.info('Seeding already in progress.')
        return
      }
      if (error) {
        toast.error('An error occurred, please refresh and try again.')
        return
      }

      setLoading(true)

      try {
        toast.promise(
          new Promise<void>((resolve, reject) => {
            fetch('/next/seed-posts', { method: 'POST', credentials: 'include' })
              .then((res) => {
                if (res.ok) {
                  resolve()
                  setSeeded(true)
                } else {
                  reject('An error occurred while seeding posts.')
                }
              })
              .catch(reject)
          }),
          {
            loading: 'Creating 50 posts... (this takes about 60–90 seconds)',
            success: <SuccessMessage />,
            error: 'An error occurred while seeding posts.',
          },
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(errorMessage)
      }
    },
    [loading, seeded, error],
  )

  let message = ''
  if (loading) message = ' (seeding...)'
  if (seeded) message = ' (done!)'
  if (error) message = ` (error: ${error})`

  return (
    <Fragment>
      <button className="seedPostsButton" onClick={handleClick}>
        Seed 50 posts
      </button>
      {message}
    </Fragment>
  )
}

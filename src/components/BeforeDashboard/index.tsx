import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import { SeedPostsButton } from './SeedPostsButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your dashboard!</h4>
      </Banner>
      Here&apos;s what to do next:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' with a few pages, posts, and projects to jump-start your new site, then '}
          <a href="/" target="_blank">
            visit your website
          </a>
          {' to see the results.'}
        </li>
        <li>
          {'Modify your '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            collections
          </a>
          {' and add more '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            fields
          </a>
          {' as needed. If you are new to Payload, we also recommend you check out the '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            Getting Started
          </a>
          {' docs.'}
        </li>
        <li>
          Commit and push your changes to the repository to trigger a redeployment of your project.
        </li>
      </ul>
      {'Pro Tip: This block is a '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        custom component
      </a>
      , you can remove it at any time by updating your <strong>payload.config</strong>.
      <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--theme-elevation-150)' }} />
      <h4>Seed keyword test data</h4>
      <p style={{ marginBottom: '0.75rem' }}>
        <SeedPostsButton />
        {' to create 50 published posts for keyword functionality testing.'}
      </p>
      <p style={{ marginBottom: '0.5rem' }}>
        {'Each post is tagged with 2 of 8 keywords: '}
        <strong>payload, ai, design system, accessibility, self hosting, ui/ux design, penpot, claude</strong>
        {'. Covers all 28 unique keyword pairs plus 22 additional posts (50 total). Idempotent — re-running deletes and recreates without duplicates.'}
      </p>
      <p>
        {'Requires the main database seed to have run first (needs the Technology category and post-launch-hero.png media).'}
      </p>
    </div>
  )
}

export default BeforeDashboard

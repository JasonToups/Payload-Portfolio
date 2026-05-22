'use client'

import React, { useState } from 'react'
import { type Icon, ButterflyIcon, ThreadsLogoIcon, XLogoIcon } from '@phosphor-icons/react'
import { buildShareUrl, type SocialPlatform, type SocialProfile } from '@/utilities/buildShareUrl'
import { ExportIcon } from '@phosphor-icons/react/dist/ssr'

type IconButtonProps = {
  icon: Icon
  label: string
  onClick: () => void
}

const IconButton: React.FC<IconButtonProps> = ({ icon: PhosphorIcon, label, onClick }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="hover:opacity-60 transition-opacity"
  >
    <PhosphorIcon size={32} weight="bold" aria-hidden="true" />
  </button>
)

type SocialShareBarProps = {
  slug: string
  title: string
  profiles?: SocialProfile[]
  keywords?: string[]
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  slug,
  title,
  profiles,
  keywords,
}) => {
  const [copied, setCopied] = useState(false)

  const getPostUrl = (): string => `${window.location.origin}/posts/${slug}`

  const handleExport = async (): Promise<void> => {
    const url = getPostUrl()
    if (navigator.share) {
      await navigator.share({ url, title })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = (platform: SocialPlatform): void => {
    const profileUrl = profiles?.find((p) => p.platform === platform)?.url
    const options =
      platform === 'threads'
        ? { text: title, tag: keywords?.[0], profileUrl }
        : { profileUrl, hashtags: keywords }
    window.open(buildShareUrl(platform, getPostUrl(), options), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col gap-4.5 py-6">
      <span className="font-plus-Jakarta-Sans text-2xl text-end md:text-start font-normal leading-none text-foreground">
        Share
      </span>
      <div className="flex flex-row-reverse md:flex-row justify-start items-center gap-6">
        <IconButton
          icon={ExportIcon}
          label={copied ? 'Copied!' : 'Copy link'}
          onClick={() => void handleExport()}
        />
        <IconButton
          icon={XLogoIcon}
          label="Share on X / Twitter"
          onClick={() => handleShare('twitter')}
        />
        <IconButton
          icon={ThreadsLogoIcon}
          label="Share on Threads"
          onClick={() => handleShare('threads')}
        />
        <IconButton
          icon={ButterflyIcon}
          label="Share on Bluesky"
          onClick={() => handleShare('bluesky')}
        />
      </div>
    </div>
  )
}

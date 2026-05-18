'use client'

import React, { useState } from 'react'
import {
  buildShareUrl,
  type SocialPlatform,
  type SocialProfile,
} from '@/utilities/buildShareUrl'

type IconButtonProps = {
  iconSrc: string
  label: string
  onClick: () => void
}

const IconButton: React.FC<IconButtonProps> = ({ iconSrc, label, onClick }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="hover:opacity-60 transition-opacity"
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={iconSrc} width={32} height={32} alt="" aria-hidden="true" />
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
    window.open(
      buildShareUrl(platform, getPostUrl(), title, { profileUrl, hashtags: keywords }),
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="flex flex-col gap-4.5 py-6">
      <span className="font-plus-Jakarta-Sans text-[24px] font-normal leading-none text-foreground">
        Share
      </span>
      <div className="flex flex-row items-center gap-4">
        <IconButton
          iconSrc="/icons/export-bold.svg"
          label={copied ? 'Copied!' : 'Copy link'}
          onClick={() => void handleExport()}
        />
        <IconButton
          iconSrc="/icons/x-logo-bold.svg"
          label="Share on X / Twitter"
          onClick={() => handleShare('twitter')}
        />
        <IconButton
          iconSrc="/icons/threads-logo-bold.svg"
          label="Share on Threads"
          onClick={() => handleShare('threads')}
        />
        <IconButton
          iconSrc="/icons/bluesky-bold.svg"
          label="Share on Bluesky"
          onClick={() => handleShare('bluesky')}
        />
        <IconButton
          iconSrc="/icons/linkedin-logo-bold.svg"
          label="Share on LinkedIn"
          onClick={() => handleShare('linkedin')}
        />
      </div>
    </div>
  )
}

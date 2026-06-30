'use client'

type SocialPlatform = 'twitter' | 'threads' | 'bluesky' | 'linkedin' | 'facebook'

type SocialShare = {
  platform: SocialPlatform
  sharedAt: string
  shareUrl?: string | null
  id?: string | null
}

type SocialSharesCellProps = {
  rowData?: {
    socialShares?: SocialShare[] | null
  }
}

const PLATFORM_DISPLAY: Record<SocialPlatform, string> = {
  twitter: 'X',
  threads: 'Th',
  bluesky: 'Sky',
  linkedin: 'Li',
  facebook: 'Fb',
}

const SocialSharesCell: React.FC<SocialSharesCellProps> = ({ rowData }) => {
  const shares = rowData?.socialShares

  if (!shares || shares.length === 0) {
    return (
      <span style={{ color: 'var(--theme-text-dim)', fontSize: '16px', lineHeight: 1 }}>—</span>
    )
  }

  const platforms = [...new Set(shares.map((s) => s.platform))]
  const platformList = platforms.map((p) => PLATFORM_DISPLAY[p] ?? p).join(' · ')

  return (
    <span
      title={`${shares.length} share(s): ${platforms.map((p) => PLATFORM_DISPLAY[p]).join(', ')}`}
      style={{ color: 'var(--theme-success-500)', fontSize: '13px' }}
    >
      ✓&nbsp;{platformList}
    </span>
  )
}

export default SocialSharesCell

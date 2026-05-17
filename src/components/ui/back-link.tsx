'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import React from 'react'

export const BackLink: React.FC = () => {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mt-2"
    >
      <ArrowLeft size={14} aria-hidden="true" /> back
    </button>
  )
}

'use client'
import React, { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface PostsSearchFormProps {
  defaultValue?: string
  basePath?: string
}

export const PostsSearchForm: React.FC<PostsSearchFormProps> = ({
  defaultValue = '',
  basePath = '/posts',
}) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    if (q) {
      router.push(`${basePath}?q=${encodeURIComponent(q)}`)
    } else {
      router.push(basePath)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search posts..."
        className={[
          'font-mono text-sm bg-transparent border border-border rounded-md',
          'px-3 py-2 w-[260px] placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-1 focus:ring-primary-base',
        ].join(' ')}
        aria-label="Search posts"
      />
      <button
        type="submit"
        className={[
          'flex items-center justify-center p-2 rounded-md border border-border',
          'text-muted-foreground hover:text-foreground hover:border-foreground transition-colors',
        ].join(' ')}
        aria-label="Submit search"
      >
        <MagnifyingGlass size={18} />
      </button>
    </form>
  )
}

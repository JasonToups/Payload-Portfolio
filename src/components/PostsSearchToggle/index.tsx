'use client'
import React, { useState } from 'react'
import { ButtonIcon } from '@/components/ui/ButtonIcon'
import { PostsSearchForm } from '@/components/PostsSearch'

interface PostsSearchToggleProps {
  defaultValue?: string
  basePath?: string
  searchQuery?: string
}

export const PostsSearchToggle: React.FC<PostsSearchToggleProps> = ({
  defaultValue = '',
  basePath = '/posts',
  searchQuery = '',
}) => {
  const [showSearch, setShowSearch] = useState(searchQuery.length > 0)

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
      <div className="header-icon-container flex flex-row w-full justify-between">
        <h2 className="font-display text-4xl font-normal">All Posts</h2>
        <button
          onClick={() => setShowSearch((prev) => !prev)}
          className="md:hidden text-primary-base"
          aria-label={showSearch ? 'Hide search' : 'Show search'}
          aria-expanded={showSearch}
        >
          <ButtonIcon name="magnifying-glass" size={24} />
        </button>
      </div>
      <div className={showSearch ? 'block' : 'hidden md:block'}>
        <PostsSearchForm defaultValue={defaultValue} basePath={basePath} />
      </div>
    </div>
  )
}

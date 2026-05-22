'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { FormAndButton } from '@/components/ui/form-and-button'

interface PostsSearchFormProps {
  defaultValue?: string
  basePath?: string
}

export const PostsSearchForm: React.FC<PostsSearchFormProps> = ({
  defaultValue = '',
  basePath = '/posts',
}) => {
  const router = useRouter()

  const handleSubmit = (value: string) => {
    if (value) {
      router.push(`${basePath}?q=${encodeURIComponent(value)}`)
    } else {
      router.push(basePath)
    }
  }

  return (
    <FormAndButton
      placeholder="Search posts..."
      buttonLabel="Search"
      defaultValue={defaultValue}
      onSubmit={handleSubmit}
    />
  )
}

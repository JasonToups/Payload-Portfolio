import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  if (appearance === 'animated') {
    return (
      <Link
        href={href || url || ''}
        {...newTabProps}
        className={cn(
          'group block rounded-full overflow-hidden transition-colors duration-300',
          'bg-primary-dark hover:bg-primary-mid focus-visible:bg-primary-mid',
          'dark:bg-primary-base dark:hover:bg-primary-pale dark:focus-visible:bg-primary-pale',
          className,
        )}
      >
        <span
          className={cn(
            'mr-3 group-hover:mx-0 group-focus-visible:mx-0',
            'flex items-center justify-start group-hover:justify-between group-focus-visible:justify-between gap-2',
            'px-6 py-4',
            'rounded-full',
            'text-base font-medium',
            'transition-all duration-300',
            'bg-primary-mid group-hover:bg-transparent group-focus-visible:bg-transparent',
            'text-primary-pale',
            'dark:bg-primary-pale dark:text-primary-dark',
          )}
        >
          <span>{label ?? children}</span>
          <span aria-hidden="true">→</span>
        </span>
      </Link>
    )
  }

  if (appearance === 'large' || appearance === 'large-secondary') {
    return (
      <Button asChild className={className} variant={appearance}>
        <Link href={href || url || ''} {...newTabProps}>
          <span>{label ?? children}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </Button>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}

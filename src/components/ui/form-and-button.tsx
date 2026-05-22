'use client'
import React, { useState } from 'react'
import { ArrowRight, X } from '@phosphor-icons/react'
import { cn } from '@/utilities/ui'

interface FormAndButtonProps {
  placeholder?: string
  buttonLabel?: string
  defaultValue?: string
  onSubmit: (value: string) => void
  className?: string
}

export const FormAndButton: React.FC<FormAndButtonProps> = ({
  placeholder = 'Search...',
  buttonLabel = 'Search',
  defaultValue = '',
  onSubmit,
  className,
}) => {
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(value.trim())
  }

  const handleClear = () => {
    setValue('')
    onSubmit('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex items-center justify-end w-full gap-3', className)}
    >
      <div className="relative flex flex-1 items-center md:flex-none">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'font-sans text-[16px] rounded-[8px] h-14 px-4',
            'w-full md:w-[318px]',
            'bg-neutral-50 dark:bg-neutral-850 border border-border',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:border-primary-bright transition-colors',
            value && 'pr-10',
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <button
        type="submit"
        className={cn(
          'flex shrink-0 items-center justify-center gap-2 h-14 px-4',
          'bg-primary-bright rounded-[10px]',
          'font-sans text-[16px] font-medium text-primary-dark',
          'whitespace-nowrap hover:brightness-105 transition-[filter]',
        )}
      >
        {buttonLabel}
        <ArrowRight size={20} className="text-primary-dark" />
      </button>
    </form>
  )
}

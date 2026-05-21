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
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-[10px]', className)}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'font-sans text-[16px] bg-[#f9f8f6] border border-[#dcdad6] rounded-[8px]',
            'h-14 w-[318px] px-4',
            'text-[#1d1b19] placeholder:text-[#6b6866]',
            'focus:outline-none focus:border-[#42d9fa] transition-colors',
            value && 'pr-10',
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 flex items-center justify-center text-[#6b6866] hover:text-[#1d1b19] transition-colors"
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <button
        type="submit"
        className={cn(
          'flex items-center justify-center gap-2 h-14 px-4',
          'bg-[#42d9fa] rounded-[10px]',
          'font-sans text-[16px] font-medium text-[#003451]',
          'whitespace-nowrap hover:brightness-105 transition-[filter]',
        )}
      >
        {buttonLabel}
        <ArrowRight size={20} className="text-[#003451]" />
      </button>
    </form>
  )
}

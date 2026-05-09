import { cn } from '@/utilities/ui'
import * as React from 'react'

const Input: React.FC<
  {
    ref?: React.Ref<HTMLInputElement>
  } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ type, className, ref, ...props }) => {
  return (
    <input
      className={cn(
        'flex w-full rounded border border-border bg-transparent px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
}

export { Input }

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        default: 'h-8 px-[9px] py-1',
        icon: 'h-10 w-10',
        lg: 'h-11 px-4 py-2.5',
        sm: 'h-9 rounded px-3',
      },
      variant: {
        // Primary — identical in light and dark themes
        default:
          'rounded-[10px] bg-primary-light text-primary-dark px-4 py-4 hover:bg-primary-dark hover:text-primary-pale hover:shadow-[1px_1px_1px_rgba(0,255,255,0.75),inset_-1px_-1px_3px_rgba(112,255,255,1)] focus-visible:bg-primary-dark focus-visible:text-primary-pale',
        // Large Primary — same palette as default, larger sizing, stronger glow, gap for arrow icon
        large:
          'gap-2 rounded-[10px] bg-primary-bright text-primary-dark h-11 px-6 py-7 hover:bg-primary-dark hover:text-primary-pale hover:shadow-[-2px_-1px_1px_rgba(0,255,255,0.75),2px_1px_1px_rgba(112,255,255,0.75),inset_-2px_-2px_2px_rgba(0,255,255,0.75),inset_2px_2px_2px_rgba(112,255,255,0.75)] focus-visible:bg-primary-dark focus-visible:text-primary-pale',
        // Secondary — inverted between light and dark themes
        secondary:
          'rounded-[10px] bg-primary-dark text-neutral-50 hover:bg-neutral-700 hover:shadow-[inset_0_0_0_1px_#f8f4f1,1px_1px_4px_rgba(255,255,255,0.75),inset_0_0_5px_1px_rgba(255,255,255,0.75)] focus-visible:bg-neutral-700 dark:bg-neutral-50 dark:text-primary-dark dark:hover:bg-neutral-700 dark:hover:text-neutral-50 dark:focus-visible:bg-neutral-700 dark:focus-visible:text-neutral-50',
        // Large Secondary — secondary colors at large sizing, with gap for arrow icon
        'large-secondary':
          'gap-2 rounded-[10px] h-11 px-4 py-2.5 bg-primary-dark text-neutral-50 hover:bg-neutral-700 hover:shadow-[inset_0_0_0_1px_#f8f4f1,1px_1px_4px_rgba(255,255,255,0.75),inset_0_0_5px_1px_rgba(255,255,255,0.75)] focus-visible:bg-neutral-700 dark:bg-neutral-50 dark:text-primary-dark dark:hover:bg-neutral-700 dark:hover:text-neutral-50 dark:focus-visible:bg-neutral-700 dark:focus-visible:text-neutral-50',
        // Animated pill — single-element approximation (CMSLink renders the full two-layer structure)
        animated:
          'rounded-full bg-primary-mid text-primary-pale hover:bg-primary-dark focus-visible:bg-primary-dark dark:bg-primary-pale dark:text-primary-dark dark:hover:bg-primary-base dark:focus-visible:bg-primary-base',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:bg-destructive/90',
        ghost:
          'hover:bg-card hover:text-accent-foreground focus-visible:bg-card focus-visible:text-accent-foreground',
        link: 'text-primary items-start justify-start underline-offset-4 hover:underline focus-visible:underline',
        outline:
          'border border-border bg-background hover:bg-card hover:text-accent-foreground focus-visible:bg-card focus-visible:text-accent-foreground',
      },
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  className,
  size,
  variant,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />
}

export { Button, buttonVariants }

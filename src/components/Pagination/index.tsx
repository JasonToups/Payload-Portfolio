'use client'
import { cn } from '@/utilities/ui'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

interface PaginationProps {
  basePath?: string
  className?: string
  page: number
  totalPages: number
}

function getVisiblePages(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const range: number[] = []
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
    range.push(i)
  }

  const result: (number | '...')[] = []

  if (range[0] > 1) {
    result.push(1)
    if (range[0] > 2) result.push('...')
  }

  result.push(...range)

  if (range[range.length - 1] < totalPages) {
    if (range[range.length - 1] < totalPages - 1) result.push('...')
    result.push(totalPages)
  }

  return result
}

const elementBase =
  "h-11 px-4 flex items-center justify-center overflow-hidden font-['Geist'] text-[18px] leading-none text-primary-mid bg-white dark:bg-card border border-[#f4f1ee] dark:border-border hover:bg-primary-light hover:border-[#6b6866] transition-colors"

export const Pagination: React.FC<PaginationProps> = ({
  basePath = '/posts/page',
  className,
  page,
  totalPages,
}) => {
  const router = useRouter()

  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  useEffect(() => {
    if (hasNextPage) router.prefetch(`${basePath}/${page + 1}`)
    if (hasPrevPage) router.prefetch(`${basePath}/${page - 1}`)
  }, [basePath, page, hasNextPage, hasPrevPage, router])

  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile layout — Previous / dotted separator / Next */}
      <div className="flex items-center py-10 px-[15px] md:hidden">
        <div className="flex items-center justify-between gap-[7px] flex-1">
          <button
            aria-label="Go to previous page"
            disabled={!hasPrevPage}
            onClick={() => hasPrevPage && router.push(`${basePath}/${page - 1}`)}
            className={cn(
              'h-11 px-4 flex items-center gap-2 overflow-hidden',
              'bg-primary-bright border border-primary-pale hover:bg-primary-light hover:border-[#6b6866]',
              'rounded-tl-[10px] rounded-br-[10px]',
              "font-['Geist'] text-[18px] leading-none text-primary-mid whitespace-nowrap",
              'transition-colors',
              !hasPrevPage && 'opacity-40 cursor-not-allowed pointer-events-none',
            )}
          >
            <ArrowLeft className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span>Previous</span>
          </button>

          <div
            aria-hidden="true"
            className="flex-1 self-center border-t-[3px] border-dotted border-[#ddd6cf] dark:border-[#6b6866]"
            role="separator"
          />

          <button
            aria-label="Go to next page"
            disabled={!hasNextPage}
            onClick={() => hasNextPage && router.push(`${basePath}/${page + 1}`)}
            className={cn(
              'h-11 px-4 flex flex-row-reverse items-center gap-2 overflow-hidden',
              'bg-primary-bright border border-primary-pale hover:bg-primary-base hover:border-[#6b6866]',
              'rounded-tr-[10px] rounded-bl-[10px]',
              "font-['Geist'] text-[18px] leading-none text-primary-mid whitespace-nowrap",
              'transition-colors',
              !hasNextPage && 'opacity-40 cursor-not-allowed pointer-events-none',
            )}
          >
            <ArrowRight className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span>Next</span>
          </button>
        </div>
      </div>

      {/* Desktop layout — full page number strip */}
      <nav
        aria-label="Pagination"
        className="hidden sticky-bottom md:flex w-full justify-center items-center gap-2 py-10"
      >
        <div className="md:flex items-start py-10">
          <button
            aria-label="Go to previous page"
            disabled={!hasPrevPage}
            onClick={() => hasPrevPage && router.push(`${basePath}/${page - 1}`)}
            className={cn(
              elementBase,
              'rounded-tl-[10px] rounded-bl-[10px] min-w-[56px]',
              !hasPrevPage && 'opacity-40 cursor-not-allowed pointer-events-none',
            )}
          >
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          </button>

          {visiblePages.map((p, idx) =>
            p === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                aria-hidden="true"
                className={cn(elementBase, 'pointer-events-none min-w-[44px]')}
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                onClick={() => router.push(`${basePath}/${p}`)}
                className={cn(
                  elementBase,
                  'min-w-[44px]',
                  p === page &&
                    'bg-primary-bright border-primary-mid hover:bg-primary-bright hover:border-primary-pale',
                )}
              >
                {p}
              </button>
            ),
          )}

          <button
            aria-label="Go to next page"
            disabled={!hasNextPage}
            onClick={() => hasNextPage && router.push(`${basePath}/${page + 1}`)}
            className={cn(
              elementBase,
              'rounded-tr-[10px] rounded-br-[10px] min-w-[56px]',
              !hasNextPage && 'opacity-40 cursor-not-allowed pointer-events-none',
            )}
          >
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </div>
  )
}

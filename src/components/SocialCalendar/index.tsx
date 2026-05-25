'use client'

import { useEffect, useState } from 'react'

type CalendarPost = {
  id: number
  title: string
  publishedAt: string
  slug: string
}

type CalendarScheduledPost = {
  id: number
  platform: 'linkedin' | 'bluesky' | 'threads'
  status: string
  scheduledFor: string
  publishedAt?: string | null
  post?: { title?: string; slug?: string } | number | null
}

type CalendarBroadcast = {
  id: number
  subject: string
  sendStatus: string
  scheduledAt?: string | null
  sentAt?: string | null
}

type CalendarItem =
  | { kind: 'post'; date: Date; id: number; label: string; slug: string }
  | { kind: 'social'; date: Date; id: number; label: string; platform: string; status: string }
  | { kind: 'broadcast'; date: Date; id: number; label: string; sendStatus: string }

const PLATFORM_ICON: Record<string, string> = {
  linkedin: 'Li',
  bluesky: 'Sky',
  threads: 'Th',
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SocialCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [items, setItems] = useState<CalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/posts?where[_status][equals]=published&select=title,publishedAt,slug,id&limit=200&depth=0')
        .then((r) => r.json() as Promise<{ docs: CalendarPost[] }>)
        .catch(() => ({ docs: [] as CalendarPost[] })),
      fetch('/api/scheduled-social-posts?where[status][not_equals]=cancelled&limit=200&depth=1')
        .then((r) => r.json() as Promise<{ docs: CalendarScheduledPost[] }>)
        .catch(() => ({ docs: [] as CalendarScheduledPost[] })),
      fetch('/api/broadcasts?where[sendStatus][not_equals]=draft&select=subject,scheduledAt,sentAt,sendStatus,id&limit=100&depth=0')
        .then((r) => r.json() as Promise<{ docs: CalendarBroadcast[] }>)
        .catch(() => ({ docs: [] as CalendarBroadcast[] })),
    ]).then(([postsRes, socialRes, broadcastRes]) => {
      const all: CalendarItem[] = []

      for (const p of postsRes.docs) {
        if (!p.publishedAt) continue
        all.push({
          kind: 'post',
          date: new Date(p.publishedAt),
          id: p.id,
          label: p.title,
          slug: p.slug,
        })
      }

      for (const s of socialRes.docs) {
        const dateStr = s.status === 'published' ? s.publishedAt : s.scheduledFor
        if (!dateStr) continue
        const postObj = typeof s.post === 'object' && s.post ? s.post : null
        const postTitle = postObj?.title ?? 'Untitled Post'
        all.push({
          kind: 'social',
          date: new Date(dateStr),
          id: s.id,
          label: `${s.platform}: ${postTitle}`,
          platform: s.platform,
          status: s.status,
        })
      }

      for (const b of broadcastRes.docs) {
        const dateStr = b.sendStatus === 'sent' ? b.sentAt : b.scheduledAt
        if (!dateStr) continue
        all.push({
          kind: 'broadcast',
          date: new Date(dateStr),
          id: b.id,
          label: b.subject,
          sendStatus: b.sendStatus,
        })
      }

      setItems(all)
      setLoading(false)
    })
  }, [])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const totalDays = daysInMonth(year, month)
  const startDay = firstDayOfMonth(year, month)

  const itemsForDay = (day: number): CalendarItem[] =>
    items.filter((item) => {
      const d = item.date
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const pillStyle = (item: CalendarItem): React.CSSProperties => {
    if (item.kind === 'post') {
      return { background: '#22c55e', color: '#fff' }
    }
    if (item.kind === 'broadcast') {
      return { background: '#a855f7', color: '#fff' }
    }
    const s = item as Extract<CalendarItem, { kind: 'social' }>
    return s.status === 'published'
      ? { background: '#6b7280', color: '#fff' }
      : { background: '#3b82f6', color: '#fff' }
  }

  const pillHref = (item: CalendarItem): string => {
    if (item.kind === 'post') return `/admin/collections/posts/${item.id}`
    if (item.kind === 'broadcast') return `/admin/collections/broadcasts/${item.id}`
    return `/admin/collections/scheduled-social-posts/${item.id}`
  }

  const pillContent = (item: CalendarItem): string => {
    if (item.kind === 'post') return '📝'
    if (item.kind === 'broadcast') return '✉'
    const s = item as Extract<CalendarItem, { kind: 'social' }>
    return PLATFORM_ICON[s.platform] ?? s.platform
  }

  const cells: (number | null)[] = [
    ...Array<null>(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '24px' }}>
      {/* Header */}
      <div style={{ alignItems: 'center', display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: '1px solid var(--theme-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', padding: '4px 10px' }}
          type="button"
        >
          ←
        </button>
        <h2 style={{ color: 'var(--theme-text)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: '1px solid var(--theme-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', padding: '4px 10px' }}
          type="button"
        >
          →
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--theme-text-dim)', fontSize: '13px' }}>Loading calendar…</p>
      ) : (
        <>
          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAY_LABELS.map((d) => (
              <div key={d} style={{ color: 'var(--theme-text-dim)', fontSize: '11px', fontWeight: 600, padding: '4px', textAlign: 'center', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, idx) => {
              const isToday =
                day !== null &&
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day
              const dayItems = day !== null ? itemsForDay(day) : []

              return (
                <div
                  key={idx}
                  style={{
                    background: isToday ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-50)',
                    border: `1px solid ${isToday ? 'var(--theme-success-500)' : 'var(--theme-border)'}`,
                    borderRadius: '4px',
                    minHeight: '72px',
                    padding: '6px',
                  }}
                >
                  {day !== null && (
                    <>
                      <div style={{ color: isToday ? 'var(--theme-success-600)' : 'var(--theme-text-dim)', fontSize: '11px', fontWeight: isToday ? 700 : 400, marginBottom: '4px' }}>
                        {day}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayItems.map((item, i) => (
                          <a
                            key={i}
                            href={pillHref(item)}
                            onMouseEnter={() => setTooltip(item.label)}
                            onMouseLeave={() => setTooltip(null)}
                            style={{
                              ...pillStyle(item),
                              alignItems: 'center',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              display: 'flex',
                              fontSize: '10px',
                              fontWeight: 600,
                              gap: '3px',
                              overflow: 'hidden',
                              padding: '2px 4px',
                              textDecoration: 'none',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={item.label}
                          >
                            <span>{pillContent(item)}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.label.length > 12 ? `${item.label.slice(0, 12)}…` : item.label}
                            </span>
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
            {[
              { color: '#22c55e', label: 'Published Post' },
              { color: '#3b82f6', label: 'Scheduled Social Post' },
              { color: '#6b7280', label: 'Published Social Post' },
              { color: '#a855f7', label: 'Broadcast' },
            ].map(({ color, label }) => (
              <div key={label} style={{ alignItems: 'center', display: 'flex', gap: '5px' }}>
                <span style={{ background: color, borderRadius: '3px', display: 'inline-block', height: '10px', width: '16px' }} />
                <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Global tooltip */}
      {tooltip && (
        <div style={{
          background: 'var(--theme-elevation-900)',
          borderRadius: '4px',
          bottom: '16px',
          color: '#fff',
          fontSize: '12px',
          left: '50%',
          maxWidth: '300px',
          padding: '6px 10px',
          position: 'fixed',
          transform: 'translateX(-50%)',
          zIndex: 100,
        }}>
          {tooltip}
        </div>
      )}
    </div>
  )
}

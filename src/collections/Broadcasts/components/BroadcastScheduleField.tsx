'use client'

import { DatePicker, useField } from '@payloadcms/ui'
import type { DateFieldClientProps } from 'payload'
import { useEffect, useState } from 'react'

export const BroadcastScheduleField: React.FC<DateFieldClientProps> = ({ path }) => {
  const { value: scheduledAt, setValue } = useField<string | null>({ path })
  const [isChecked, setIsChecked] = useState(Boolean(scheduledAt))

  // Sync checkbox when scheduledAt changes externally (e.g. initial load)
  useEffect(() => {
    setIsChecked(Boolean(scheduledAt))
  }, [scheduledAt])

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsChecked(checked)
    if (!checked) {
      setValue(null)
    }
  }

  const handleDateChange = (val: Date | null) => {
    if (!val || val <= new Date()) return
    setValue(val.toISOString())
  }

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '8px 0 16px',
      }}
    >
      <label
        style={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'flex',
          gap: '8px',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <input
          checked={isChecked}
          onChange={handleCheckboxChange}
          style={{ cursor: 'pointer', height: '15px', width: '15px' }}
          type="checkbox"
        />
        <span style={{ color: 'var(--theme-text)', fontSize: '13px', fontWeight: 500 }}>
          Schedule Broadcast
        </span>
      </label>
      {isChecked && (
        <DatePicker
          onChange={(val) => handleDateChange(val instanceof Date ? val : null)}
          pickerAppearance="dayAndTime"
          value={scheduledAt ? new Date(scheduledAt) : undefined}
        />
      )}
    </div>
  )
}

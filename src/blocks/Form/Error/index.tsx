'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <p role="alert" className="mt-2" style={{ color: 'var(--error)', fontSize: '1rem' }}>
      {(errors[name]?.message as string) || 'This field is required'}
    </p>
  )
}

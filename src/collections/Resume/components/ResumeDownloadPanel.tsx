'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type ExportFormat = 'markdown' | 'pdf' | 'docx'

interface DownloadState {
  loading: ExportFormat | null
  error: string | null
}

async function downloadExport(id: string, format: ExportFormat): Promise<string | null> {
  const res = await fetch(`/api/resume/export/${id}/${format}`)

  if (!res.ok) {
    const text = await res.text()
    return text || `Export failed (${res.status})`
  }

  const disposition = res.headers.get('content-disposition') ?? ''
  const match = disposition.match(/filename="?([^"]+)"?/)
  const filename = match?.[1] ?? `resume.${format === 'markdown' ? 'md' : format}`

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return null
}

const ResumeDownloadPanel: React.FC = () => {
  const [state, setState] = useState<DownloadState>({ loading: null, error: null })
  const { id } = useDocumentInfo()

  if (!id) {
    return (
      <div style={{ borderTop: '1px solid var(--theme-border-color)', marginTop: '24px', paddingTop: '20px' }}>
        <p style={{ fontSize: '13px', color: 'var(--theme-text-dim)' }}>
          Save the resume first to enable downloads.
        </p>
      </div>
    )
  }

  const handleDownload = async (format: ExportFormat) => {
    setState({ loading: format, error: null })
    const error = await downloadExport(String(id), format)
    setState({ loading: null, error })
  }

  const buttons: { format: ExportFormat; label: string }[] = [
    { format: 'markdown', label: 'Download Markdown' },
    { format: 'pdf', label: 'Download PDF' },
    { format: 'docx', label: 'Download DocX' },
  ]

  return (
    <div style={{ borderTop: '1px solid var(--theme-border-color)', marginTop: '24px', paddingTop: '20px' }}>
      <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px' }}>Export Resume</h4>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {buttons.map(({ format, label }) => (
          <button
            key={format}
            type="button"
            className="btn btn--style-secondary btn--size-medium"
            disabled={state.loading !== null}
            onClick={() => handleDownload(format)}
          >
            {state.loading === format ? 'Downloading…' : label}
          </button>
        ))}
      </div>
      {state.error && (
        <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--theme-error-500)' }}>
          {state.error}
        </p>
      )}
    </div>
  )
}

export default ResumeDownloadPanel

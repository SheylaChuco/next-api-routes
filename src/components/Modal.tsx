'use client'

import { useEffect, useId } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = 'max-w-xl',
}: Props) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`animate-pop max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl ${maxWidth}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="press rounded-full p-2 text-muted hover:bg-lilac hover:text-brand-dark"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

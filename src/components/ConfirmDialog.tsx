'use client'

import { Loader2, TriangleAlert } from 'lucide-react'
import Modal from './Modal'
import { btnGhost } from '@/lib/ui'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-peach text-[#b42318]">
          <TriangleAlert size={22} aria-hidden="true" />
        </div>
        <p className="pt-1 text-sm leading-relaxed text-muted">{message}</p>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className={btnGhost} disabled={loading}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="press inline-flex items-center justify-center gap-2 rounded-full bg-[#b42318] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8f1b12] disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

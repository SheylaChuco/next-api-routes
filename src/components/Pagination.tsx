'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

// Devuelve las páginas a mostrar, con "…" cuando hay muchas
function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push('…')
  pages.push(total)
  return pages
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  const base =
    'press inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold'

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`${base} border border-line bg-white text-ink hover:border-brand disabled:opacity-40`}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="px-1 text-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Página ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`${base} ${
              p === page
                ? 'bg-brand text-white shadow-md shadow-brand/30'
                : 'border border-line bg-white text-ink hover:border-brand'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={`${base} border border-line bg-white text-ink hover:border-brand disabled:opacity-40`}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  )
}

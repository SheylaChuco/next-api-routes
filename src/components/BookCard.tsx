'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, FileText, Pencil, Trash2 } from 'lucide-react'
import type { Book } from '@/lib/types'
import { tintFor } from '@/lib/ui'

type Props = {
  book: Book
  index?: number
  showAuthor?: boolean
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

export default function BookCard({ book, index = 0, showAuthor = true, onEdit, onDelete }: Props) {
  const tint = tintFor(book.genre || book.title)
  const [coverFailed, setCoverFailed] = useState(false)
  const showCover = Boolean(book.coverUrl) && !coverFailed

  return (
    <article
      className="group lift animate-rise flex flex-col overflow-hidden rounded-3xl border border-line bg-white"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className={`relative flex items-center justify-center overflow-hidden ${tint.soft} ${showCover ? 'h-56' : 'h-28'}`}>
        {showCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverUrl as string}
            alt={`Portada de ${book.title}`}
            loading="lazy"
            onError={() => setCoverFailed(true)}
            className="h-full w-auto max-w-full rounded-md object-contain py-3 shadow-sm transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-y-0 left-6 w-2 rounded-b-md bg-white/60" aria-hidden="true" />
            <BookOpen size={44} className={tint.ink} aria-hidden="true" />
          </>
        )}
        {book.genre && (
          <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
            {book.genre}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-bold leading-snug text-ink">{book.title}</h3>
          {showAuthor && book.author && (
            <Link
              href={`/authors/${book.author.id}`}
              className="mt-1 inline-block text-sm font-medium text-brand-dark hover:underline"
            >
              {book.author.name}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={15} aria-hidden="true" />
            {book.publishedYear ?? 'Sin año'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText size={15} aria-hidden="true" />
            {book.pages ? `${book.pages} págs.` : 'Sin páginas'}
          </span>
        </div>

        {book.description && (
          <p className="line-clamp-2 text-sm text-muted">{book.description}</p>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onEdit(book)}
            aria-label={`Editar ${book.title}`}
            className="press inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand-dark"
          >
            <Pencil size={14} aria-hidden="true" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(book)}
            aria-label={`Eliminar ${book.title}`}
            className="press inline-flex items-center gap-1.5 rounded-full border border-[#f3c2c2] px-3.5 py-2 text-xs font-semibold text-[#b42318] hover:bg-[#fff0ee]"
          >
            <Trash2 size={14} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}

'use client'

import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Book } from '@/lib/types'
import { btnGhost, btnPrimary, inputClass, labelClass } from '@/lib/ui'

type Props = {
  book?: Book | null
  authors: { id: string; name: string }[]
  // Si viene, el autor queda fijo (por ejemplo desde la página del autor)
  lockedAuthorId?: string
  knownGenres?: string[]
  onSaved: () => void
  onCancel: () => void
}

export default function BookForm({
  book,
  authors,
  lockedAuthorId,
  knownGenres = [],
  onSaved,
  onCancel,
}: Props) {
  const genresId = useId()
  const [form, setForm] = useState({
    title: book?.title ?? '',
    authorId: book?.authorId ?? lockedAuthorId ?? '',
    genre: book?.genre ?? '',
    publishedYear: book?.publishedYear ? String(book.publishedYear) : '',
    pages: book?.pages ? String(book.pages) : '',
    isbn: book?.isbn ?? '',
    coverUrl: book?.coverUrl ?? '',
    description: book?.description ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      title: form.title.trim(),
      authorId: form.authorId,
      genre: form.genre.trim() || null,
      publishedYear: form.publishedYear || null,
      pages: form.pages || null,
      isbn: form.isbn.trim() || null,
      coverUrl: form.coverUrl.trim() || null,
      description: form.description.trim() || null,
    }

    try {
      const res = await fetch(book ? `/api/books/${book.id}` : '/api/books', {
        method: book ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ocurrió un error')
        return
      }
      onSaved()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="book-title" className={labelClass}>Título *</label>
        <input
          id="book-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          minLength={3}
          placeholder="Ej. La casa de los espíritus"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="book-author" className={labelClass}>Autor *</label>
        <select
          id="book-author"
          name="authorId"
          value={form.authorId}
          onChange={handleChange}
          required
          disabled={Boolean(lockedAuthorId)}
          className={inputClass}
        >
          <option value="">Selecciona un autor</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="book-genre" className={labelClass}>Género</label>
        <input
          id="book-genre"
          name="genre"
          value={form.genre}
          onChange={handleChange}
          list={genresId}
          placeholder="Ej. Novela"
          className={inputClass}
        />
        <datalist id={genresId}>
          {knownGenres.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="book-year" className={labelClass}>Año de publicación</label>
        <input
          id="book-year"
          name="publishedYear"
          type="number"
          value={form.publishedYear}
          onChange={handleChange}
          placeholder="Ej. 1982"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="book-pages" className={labelClass}>Páginas</label>
        <input
          id="book-pages"
          name="pages"
          type="number"
          min={1}
          value={form.pages}
          onChange={handleChange}
          placeholder="Ej. 433"
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="book-isbn" className={labelClass}>ISBN</label>
        <input
          id="book-isbn"
          name="isbn"
          value={form.isbn}
          onChange={handleChange}
          placeholder="Opcional, no se puede repetir"
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="book-cover" className={labelClass}>URL de la portada</label>
        <input
          id="book-cover"
          name="coverUrl"
          type="url"
          value={form.coverUrl}
          onChange={handleChange}
          placeholder="https://... (opcional)"
          className={inputClass}
        />
        {/^https?:\/\//.test(form.coverUrl.trim()) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.coverUrl.trim()}
            alt="Vista previa de la portada"
            className="mt-3 h-32 w-auto rounded-xl border border-line object-cover"
            onError={(e) => (e.currentTarget.style.display = 'none')}
            onLoad={(e) => (e.currentTarget.style.display = 'block')}
          />
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="book-description" className={labelClass}>Descripción</label>
        <textarea
          id="book-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="De qué trata el libro"
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-[#fff0ee] px-4 py-3 text-sm text-[#b42318] sm:col-span-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
        <button type="button" onClick={onCancel} className={btnGhost} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {saving ? 'Guardando...' : book ? 'Guardar cambios' : 'Crear libro'}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookPlus,
  Calendar,
  Feather,
  FileText,
  Library,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Sparkles,
  Tags,
  Trash2,
  Trophy,
} from 'lucide-react'
import type { AuthorStats, AuthorWithBooks, Book } from '@/lib/types'
import { TINTS, btnDanger, btnGhost, btnPrimary, initials, tintFor } from '@/lib/ui'
import AuthorForm from '@/components/AuthorForm'
import BookCard from '@/components/BookCard'
import BookForm from '@/components/BookForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import CountUp from '@/components/CountUp'
import Modal from '@/components/Modal'

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [author, setAuthor] = useState<AuthorWithBooks | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  const [editAuthorOpen, setEditAuthorOpen] = useState(false)
  const [bookFormOpen, setBookFormOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [deleteAuthorOpen, setDeleteAuthorOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [authorRes, statsRes] = await Promise.all([
        fetch(`/api/authors/${id}`),
        fetch(`/api/authors/${id}/stats`),
      ])
      if (authorRes.status === 404) {
        setNotFound(true)
        return
      }
      if (!authorRes.ok) throw new Error()
      setAuthor(await authorRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
      setError('')
    } catch {
      setError('No se pudo cargar la información del autor. Revisa tu conexión a la base de datos.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  function openNewBook() {
    setEditingBook(null)
    setBookFormOpen(true)
  }

  function openEditBook(book: Book) {
    setEditingBook(book)
    setBookFormOpen(true)
  }

  function closeBookForm() {
    setBookFormOpen(false)
    setEditingBook(null)
  }

  async function handleBookSaved() {
    closeBookForm()
    await load()
  }

  async function handleAuthorSaved() {
    setEditAuthorOpen(false)
    await load()
  }

  async function confirmDeleteBook() {
    if (!deletingBook) return
    setBusy(true)
    try {
      const res = await fetch(`/api/books/${deletingBook.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'No se pudo eliminar el libro')
      } else {
        await load()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setBusy(false)
      setDeletingBook(null)
    }
  }

  async function confirmDeleteAuthor() {
    setBusy(true)
    try {
      const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'No se pudo eliminar el autor')
        setBusy(false)
        setDeleteAuthorOpen(false)
        return
      }
      router.push('/')
    } catch {
      setError('Error de conexión')
      setBusy(false)
      setDeleteAuthorOpen(false)
    }
  }

  const backLink = (
    <Link
      href="/"
      className="press inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-lilac"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Volver a autores
    </Link>
  )

  if (loading) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6" aria-busy="true">
        <div className="shimmer h-10 w-48 rounded-full" />
        <div className="shimmer h-56 rounded-[2rem]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-28 rounded-3xl" />
          ))}
        </div>
      </main>
    )
  }

  if (notFound || !author) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
        {backLink}
        <div className="rounded-3xl border border-dashed border-brand/40 bg-white/70 p-10 text-center">
          <p className="font-display text-xl font-bold">
            {notFound ? 'No encontramos a este autor' : 'No se pudo cargar'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {notFound ? 'Puede que haya sido eliminado.' : error}
          </p>
        </div>
      </main>
    )
  }

  const tint = tintFor(author.id)

  const statTiles = stats
    ? [
        {
          label: 'Libros publicados',
          icon: Library,
          tint: TINTS[0],
          content: <CountUp value={stats.totalBooks} />,
        },
        {
          label: 'Primer libro',
          icon: Calendar,
          tint: TINTS[2],
          content: stats.firstBook?.year ?? '—',
          sub: stats.firstBook?.title,
        },
        {
          label: 'Último libro',
          icon: Sparkles,
          tint: TINTS[1],
          content: stats.latestBook?.year ?? '—',
          sub: stats.latestBook?.title,
        },
        {
          label: 'Promedio de páginas',
          icon: FileText,
          tint: TINTS[3],
          content: <CountUp value={stats.averagePages} />,
        },
        {
          label: 'Libro con más páginas',
          icon: Trophy,
          tint: TINTS[0],
          content: stats.longestBook?.pages ?? '—',
          sub: stats.longestBook?.title,
        },
        {
          label: 'Libro con menos páginas',
          icon: Feather,
          tint: TINTS[2],
          content: stats.shortestBook?.pages ?? '—',
          sub: stats.shortestBook?.title,
        },
      ]
    : []

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-6 sm:px-6">
      {backLink}

      {error && (
        <div role="alert" className="rounded-2xl border border-[#f3c2c2] bg-[#fff0ee] px-4 py-3 text-sm text-[#b42318]">
          {error}
        </div>
      )}

      {/* Información del autor */}
      <section className="animate-rise overflow-hidden rounded-[2rem] border border-line bg-white">
        <div className={`h-28 ${tint.soft}`} />
        <div className="flex flex-col gap-5 px-6 pb-6 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div
              className={`-mt-14 flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-white font-display text-4xl font-bold text-white ${tint.strong}`}
              aria-hidden="true"
            >
              {initials(author.name)}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={openNewBook} className={btnPrimary}>
                <BookPlus size={18} aria-hidden="true" />
                Agregar libro
              </button>
              <button type="button" onClick={() => setEditAuthorOpen(true)} className={btnGhost}>
                <Pencil size={16} aria-hidden="true" />
                Editar autor
              </button>
              <button type="button" onClick={() => setDeleteAuthorOpen(true)} className={btnDanger}>
                <Trash2 size={16} aria-hidden="true" />
                Eliminar
              </button>
            </div>
          </div>

          <div>
            <h1 className="font-display text-4xl font-bold">{author.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={15} aria-hidden="true" />
                {author.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} aria-hidden="true" />
                {author.nationality || 'Sin nacionalidad'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={15} aria-hidden="true" />
                {author.birthYear ? `Nació en ${author.birthYear}` : 'Sin año de nacimiento'}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/80">
              {author.bio || 'Este autor todavía no tiene biografía.'}
            </p>
          </div>
        </div>
      </section>

      {/* Estadísticas del autor */}
      {stats && (
        <section aria-labelledby="stats-title" className="flex flex-col gap-4">
          <h2 id="stats-title" className="font-display text-2xl font-bold">
            Estadísticas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statTiles.map((t, i) => (
              <div
                key={t.label}
                className={`lift animate-rise rounded-3xl border border-transparent p-5 ${t.tint.soft}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted">{t.label}</p>
                  <t.icon size={22} className={t.tint.ink} aria-hidden="true" />
                </div>
                <p className="mt-2 font-display text-4xl font-bold text-ink">{t.content}</p>
                {t.sub && <p className="mt-1 truncate text-sm text-muted">{t.sub}</p>}
              </div>
            ))}
          </div>

          <div
            className="lift animate-rise rounded-3xl border border-line bg-white p-5"
            style={{ animationDelay: '420ms' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Géneros que ha escrito</p>
              <Tags size={22} className="text-brand-dark" aria-hidden="true" />
            </div>
            {stats.genres.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Todavía no hay géneros registrados.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {stats.genres.map((g) => (
                  <li
                    key={g}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold text-ink ${tintFor(g).soft}`}
                  >
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Libros del autor */}
      <section aria-labelledby="books-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="books-title" className="font-display text-2xl font-bold">
            Libros de {author.name.split(' ')[0]}{' '}
            <span className="text-base font-medium text-muted">({author.books.length})</span>
          </h2>
          <button type="button" onClick={openNewBook} className={btnGhost}>
            <BookPlus size={16} aria-hidden="true" />
            Agregar libro
          </button>
        </div>

        {author.books.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand/40 bg-white/70 p-10 text-center">
            <p className="font-display text-xl font-bold">Este autor aún no tiene libros</p>
            <p className="mb-5 mt-1 text-sm text-muted">Agrega el primero.</p>
            <button type="button" onClick={openNewBook} className={btnPrimary}>
              <BookPlus size={18} aria-hidden="true" />
              Agregar libro
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {author.books.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={i}
                showAuthor={false}
                onEdit={openEditBook}
                onDelete={setDeletingBook}
              />
            ))}
          </div>
        )}
      </section>

      <Modal
        open={editAuthorOpen}
        title="Editar autor"
        onClose={() => setEditAuthorOpen(false)}
      >
        <AuthorForm
          author={author}
          onSaved={handleAuthorSaved}
          onCancel={() => setEditAuthorOpen(false)}
        />
      </Modal>

      <Modal
        open={bookFormOpen}
        title={editingBook ? 'Editar libro' : `Nuevo libro de ${author.name}`}
        onClose={closeBookForm}
      >
        <BookForm
          book={editingBook}
          authors={[{ id: author.id, name: author.name }]}
          lockedAuthorId={author.id}
          knownGenres={stats?.genres ?? []}
          onSaved={handleBookSaved}
          onCancel={closeBookForm}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingBook)}
        title="Eliminar libro"
        message={
          deletingBook
            ? `¿Eliminar "${deletingBook.title}"? Esta acción no se puede deshacer.`
            : ''
        }
        loading={busy}
        onConfirm={confirmDeleteBook}
        onCancel={() => setDeletingBook(null)}
      />

      <ConfirmDialog
        open={deleteAuthorOpen}
        title="Eliminar autor"
        message={`¿Eliminar a ${author.name}? También se borrarán sus ${author.books.length} libro(s). Esta acción no se puede deshacer.`}
        loading={busy}
        onConfirm={confirmDeleteAuthor}
        onCancel={() => setDeleteAuthorOpen(false)}
      />

      {busy && (
        <span className="sr-only" role="status">
          <Loader2 aria-hidden="true" /> Procesando
        </span>
      )}
    </main>
  )
}

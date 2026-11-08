'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpDown,
  BookPlus,
  FilterX,
  Library,
  Loader2,
  Search,
} from 'lucide-react'
import type { Book, Pagination as PaginationInfo } from '@/lib/types'
import { btnGhost, btnPrimary, inputClass } from '@/lib/ui'
import BookCard from '@/components/BookCard'
import BookForm from '@/components/BookForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 9

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Fecha de creación' },
  { value: 'title', label: 'Título' },
  { value: 'publishedYear', label: 'Año de publicación' },
]

export default function BooksPage() {
  // Datos para los filtros
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([])
  const [genres, setGenres] = useState<string[]>([])

  // Filtros y orden
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  // Resultados
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Formularios y confirmación
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState<Book | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  // Autores y géneros disponibles para los dropdowns
  const loadFacets = useCallback(async () => {
    try {
      const [authorsRes, booksRes] = await Promise.all([
        fetch('/api/authors'),
        fetch('/api/books'),
      ])
      if (authorsRes.ok) {
        const list: { id: string; name: string }[] = await authorsRes.json()
        setAuthors(list.map((a) => ({ id: a.id, name: a.name })))
      }
      if (booksRes.ok) {
        const all: Book[] = await booksRes.json()
        const unique = [...new Set(all.map((b) => b.genre).filter((g): g is string => Boolean(g)))]
        setGenres(unique.sort((a, b) => a.localeCompare(b)))
      }
    } catch {
      // Si falla, los dropdowns quedan vacíos; el error principal se muestra al buscar
    }
  }, [])

  useEffect(() => {
    loadFacets()
  }, [loadFacets, refreshKey])

  // Búsqueda en tiempo real: espera un momento después de dejar de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Buscar en la API cada vez que cambian los filtros, el orden o la página
  useEffect(() => {
    const controller = new AbortController()
    const authorName = authors.find((a) => a.id === authorId)?.name

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sortBy,
      order,
    })
    if (search) params.set('search', search)
    if (genre) params.set('genre', genre)
    if (authorName) params.set('authorName', authorName)

    async function run() {
      setLoading(true)
      try {
        const res = await fetch(`/api/books/search?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error()
        const json: { data: Book[]; pagination: PaginationInfo } = await res.json()

        // Si se borró el último libro de una página, volver a la anterior
        if (json.data.length === 0 && json.pagination.page > 1) {
          setPage(Math.max(json.pagination.totalPages, 1))
          return
        }
        setBooks(json.data)
        setPagination(json.pagination)
        setError('')
        setLoading(false)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setError('No se pudieron cargar los libros. Revisa tu conexión a la base de datos.')
        setLoading(false)
      }
    }
    run()

    return () => controller.abort()
  }, [search, genre, authorId, sortBy, order, page, refreshKey, authors])

  const hasFilters = Boolean(searchInput || genre || authorId)

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setGenre('')
    setAuthorId('')
    setPage(1)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(book: Book) {
    setEditing(book)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function handleSaved() {
    closeForm()
    setRefreshKey((k) => k + 1)
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      const res = await fetch(`/api/books/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'No se pudo eliminar el libro')
      } else {
        setRefreshKey((k) => k + 1)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setDeleteBusy(false)
      setDeleting(null)
    }
  }

  const total = pagination?.total ?? 0
  const firstItem = total === 0 ? 0 : ((pagination?.page ?? 1) - 1) * PAGE_SIZE + 1
  const lastItem = Math.min(firstItem + books.length - 1, total)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      {/* Encabezado */}
      <section className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-brand-dark">
            <Library size={16} aria-hidden="true" />
            Catálogo
          </p>
          <h1 className="font-display text-4xl font-bold">Libros</h1>
          <p className="mt-1 text-muted">Busca, filtra y administra todos los libros.</p>
        </div>
        <button type="button" onClick={openCreate} className={btnPrimary}>
          <BookPlus size={18} aria-hidden="true" />
          Nuevo libro
        </button>
      </section>

      {/* Filtros */}
      <section
        aria-label="Búsqueda y filtros"
        className="animate-rise rounded-3xl border border-line bg-white p-4 sm:p-5"
        style={{ animationDelay: '80ms' }}
      >
        <div className="relative">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por título..."
            aria-label="Buscar libros por título"
            className={`${inputClass} pl-11`}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value)
              setPage(1)
            }}
            aria-label="Filtrar por género"
            className={inputClass}
          >
            <option value="">Todos los géneros</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={authorId}
            onChange={(e) => {
              setAuthorId(e.target.value)
              setPage(1)
            }}
            aria-label="Filtrar por autor"
            className={inputClass}
          >
            <option value="">Todos los autores</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            aria-label="Ordenar por"
            className={inputClass}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Ordenar por: {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setOrder(order === 'asc' ? 'desc' : 'asc')
              setPage(1)
            }}
            className={btnGhost}
            aria-label={`Orden ${order === 'asc' ? 'ascendente' : 'descendente'}, cambiar`}
          >
            <ArrowUpDown size={16} aria-hidden="true" />
            {order === 'asc' ? 'Ascendente' : 'Descendente'}
          </button>
        </div>
      </section>

      {/* Resultado y estado de carga */}
      <div className="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="text-sm text-muted">
          {pagination ? (
            total === 0 ? (
              'No se encontraron libros'
            ) : (
              <>
                <strong className="text-ink">{total}</strong>{' '}
                {total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                {' · '}mostrando {firstItem}–{lastItem}
              </>
            )
          ) : (
            'Cargando...'
          )}
        </p>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="inline-flex items-center gap-2 rounded-full bg-lilac px-3 py-1 text-xs font-semibold text-brand-dark">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Buscando...
            </span>
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="press inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline"
            >
              <FilterX size={16} aria-hidden="true" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-[#f3c2c2] bg-[#fff0ee] px-4 py-3 text-sm text-[#b42318]">
          {error}
        </div>
      )}

      {/* Libros */}
      {pagination === null && loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="shimmer h-72 rounded-3xl" />
          ))}
        </div>
      ) : books.length === 0 && !error ? (
        <div className="rounded-3xl border border-dashed border-brand/40 bg-white/70 p-10 text-center">
          <p className="font-display text-xl font-bold">No hay libros para mostrar</p>
          <p className="mb-5 mt-1 text-sm text-muted">
            {hasFilters
              ? 'Prueba con otra búsqueda o limpia los filtros.'
              : authors.length === 0
                ? 'Primero crea un autor y luego agrégale libros.'
                : 'Agrega el primer libro de tu biblioteca.'}
          </p>
          {authors.length === 0 && !hasFilters ? (
            <Link href="/" className={btnPrimary}>
              Ir a autores
            </Link>
          ) : (
            <button type="button" onClick={openCreate} className={btnPrimary}>
              <BookPlus size={18} aria-hidden="true" />
              Nuevo libro
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
            loading ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {books.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              index={i}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={(p) => {
            setPage(p)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}

      <Modal
        open={formOpen}
        title={editing ? 'Editar libro' : 'Nuevo libro'}
        onClose={closeForm}
      >
        {authors.length === 0 ? (
          <p className="text-sm text-muted">
            Primero necesitas crear un autor.{' '}
            <Link href="/" className="font-semibold text-brand-dark underline">
              Ir a autores
            </Link>
          </p>
        ) : (
          <BookForm
            book={editing}
            authors={authors}
            knownGenres={genres}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar libro"
        message={
          deleting
            ? `¿Eliminar "${deleting.title}"? Esta acción no se puede deshacer.`
            : ''
        }
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </main>
  )
}

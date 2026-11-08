'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChartColumn,
  Eye,
  Library,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Tags,
  Trash2,
  Users,
} from 'lucide-react'
import type { AuthorWithBooks } from '@/lib/types'
import { TINTS, btnPrimary, initials } from '@/lib/ui'
import BooksIllustration from '@/components/BooksIllustration'
import CountUp from '@/components/CountUp'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import AuthorForm from '@/components/AuthorForm'

export default function Dashboard() {
  const [authors, setAuthors] = useState<AuthorWithBooks[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AuthorWithBooks | null>(null)
  const [deleting, setDeleting] = useState<AuthorWithBooks | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const loadAuthors = useCallback(async () => {
    try {
      const res = await fetch('/api/authors')
      if (!res.ok) throw new Error()
      setAuthors(await res.json())
      setError('')
    } catch {
      setError('No se pudieron cargar los autores. Revisa tu conexión a la base de datos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAuthors()
  }, [loadAuthors])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(author: AuthorWithBooks) {
    setEditing(author)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  async function handleSaved() {
    closeForm()
    await loadAuthors()
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      const res = await fetch(`/api/authors/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'No se pudo eliminar el autor')
      } else {
        await loadAuthors()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setDeleteBusy(false)
      setDeleting(null)
    }
  }

  // Estadísticas generales
  const totalAuthors = authors.length
  const totalBooks = authors.reduce((sum, a) => sum + a._count.books, 0)
  const genreCount = new Set(
    authors.flatMap((a) => a.books.map((b) => b.genre).filter(Boolean))
  ).size
  const avgBooks = totalAuthors > 0 ? totalBooks / totalAuthors : 0

  const stats = [
    { label: 'Autores', value: totalAuthors, decimals: 0, icon: Users, tint: TINTS[0] },
    { label: 'Libros', value: totalBooks, decimals: 0, icon: Library, tint: TINTS[2] },
    { label: 'Géneros', value: genreCount, decimals: 0, icon: Tags, tint: TINTS[1] },
    { label: 'Libros por autor', value: avgBooks, decimals: 1, icon: ChartColumn, tint: TINTS[3] },
  ]

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-6 sm:px-6">
      {/* Portada */}
      <section className="animate-rise relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[2rem] bg-lilac px-6 py-8 sm:px-10">
        <div className="relative z-10 min-w-0 flex-1 basis-80">
          <p className="mb-2 text-sm font-semibold text-brand-dark">Sistema de biblioteca</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Panel de autores
          </h1>
          <p className="mb-6 mt-3 max-w-md text-base text-muted">
            Administra tus autores, mira cuántos libros tiene cada uno y encuentra todo en un solo lugar.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openCreate} className={btnPrimary}>
              <Plus size={18} aria-hidden="true" />
              Crear autor
            </button>
            <Link
              href="/books"
              className="press inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-paper"
            >
              <Library size={18} aria-hidden="true" />
              Explorar libros
            </Link>
          </div>
        </div>
        <BooksIllustration className="relative z-10 mx-auto h-auto w-64 max-w-full" />
      </section>

      {/* Estadísticas generales */}
      <section aria-label="Estadísticas generales" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`lift animate-rise rounded-3xl border border-transparent p-5 ${s.tint.soft}`}
            style={{ animationDelay: `${100 + i * 90}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{s.label}</p>
              <s.icon size={22} className={s.tint.ink} aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-4xl font-bold text-ink">
              {loading ? '–' : <CountUp value={s.value} decimals={s.decimals} />}
            </p>
          </div>
        ))}
      </section>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f3c2c2] bg-[#fff0ee] px-4 py-3 text-sm text-[#b42318]">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              loadAuthors()
            }}
            className="press rounded-full bg-white px-4 py-1.5 font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de autores */}
      <section aria-labelledby="authors-title" className="flex flex-col gap-4">
        <h2 id="authors-title" className="font-display text-2xl font-bold">
          Autores registrados
        </h2>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer h-64 rounded-3xl" />
            ))}
          </div>
        ) : authors.length === 0 && !error ? (
          <div className="rounded-3xl border border-dashed border-brand/40 bg-white/70 p-10 text-center">
            <p className="font-display text-xl font-bold">Aún no hay autores</p>
            <p className="mb-5 mt-1 text-sm text-muted">Crea el primero para empezar tu biblioteca.</p>
            <button type="button" onClick={openCreate} className={btnPrimary}>
              <Plus size={18} aria-hidden="true" />
              Crear autor
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author, i) => {
              const tint = TINTS[i % TINTS.length]
              return (
                <article
                  key={author.id}
                  className="lift animate-rise flex flex-col overflow-hidden rounded-3xl border border-line bg-white"
                  style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
                >
                  <div className={`h-20 ${tint.soft}`} />
                  <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
                    <div
                      className={`-mt-9 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-white font-display text-2xl font-bold text-white ${tint.strong}`}
                      aria-hidden="true"
                    >
                      {initials(author.name)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-ink">{author.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
                        <Mail size={14} aria-hidden="true" className="shrink-0" />
                        <span className="truncate">{author.email}</span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                        <MapPin size={14} aria-hidden="true" className="shrink-0" />
                        {author.nationality || 'Sin nacionalidad'}
                        {author.birthYear ? ` · ${author.birthYear}` : ''}
                      </p>
                    </div>

                    <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold text-ink ${tint.soft}`}>
                      {author._count.books} {author._count.books === 1 ? 'libro' : 'libros'}
                    </span>

                    <div className="mt-auto flex flex-wrap gap-2 pt-1">
                      <Link
                        href={`/authors/${author.id}`}
                        className="press inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                      >
                        <Eye size={14} aria-hidden="true" />
                        Ver libros
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(author)}
                        aria-label={`Editar a ${author.name}`}
                        className="press inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand-dark"
                      >
                        <Pencil size={14} aria-hidden="true" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(author)}
                        aria-label={`Eliminar a ${author.name}`}
                        className="press inline-flex items-center gap-1.5 rounded-full border border-[#f3c2c2] px-4 py-2 text-xs font-semibold text-[#b42318] hover:bg-[#fff0ee]"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        open={formOpen}
        title={editing ? 'Editar autor' : 'Crear autor'}
        onClose={closeForm}
      >
        <AuthorForm author={editing} onSaved={handleSaved} onCancel={closeForm} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar autor"
        message={
          deleting
            ? `¿Eliminar a ${deleting.name}? También se borrarán sus ${deleting._count.books} libro(s). Esta acción no se puede deshacer.`
            : ''
        }
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </main>
  )
}

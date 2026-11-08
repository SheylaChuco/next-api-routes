'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Author } from '@/lib/types'
import { btnGhost, btnPrimary, inputClass, labelClass } from '@/lib/ui'

type Props = {
  author?: Author | null
  onSaved: () => void
  onCancel: () => void
}

export default function AuthorForm({ author, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    name: author?.name ?? '',
    email: author?.email ?? '',
    nationality: author?.nationality ?? '',
    birthYear: author?.birthYear ? String(author.birthYear) : '',
    bio: author?.bio ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      nationality: form.nationality.trim() || null,
      birthYear: form.birthYear || null,
      bio: form.bio.trim() || null,
    }

    try {
      const res = await fetch(author ? `/api/authors/${author.id}` : '/api/authors', {
        method: author ? 'PUT' : 'POST',
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
      <div>
        <label htmlFor="author-name" className={labelClass}>Nombre *</label>
        <input
          id="author-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Ej. Isabel Allende"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="author-email" className={labelClass}>Email *</label>
        <input
          id="author-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="autor@correo.com"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="author-nationality" className={labelClass}>Nacionalidad</label>
        <input
          id="author-nationality"
          name="nationality"
          value={form.nationality}
          onChange={handleChange}
          placeholder="Ej. Chile"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="author-year" className={labelClass}>Año de nacimiento</label>
        <input
          id="author-year"
          name="birthYear"
          type="number"
          value={form.birthYear}
          onChange={handleChange}
          placeholder="Ej. 1942"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="author-bio" className={labelClass}>Biografía</label>
        <textarea
          id="author-bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          placeholder="Cuenta algo breve sobre el autor"
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
          {saving ? 'Guardando...' : author ? 'Guardar cambios' : 'Crear autor'}
        </button>
      </div>
    </form>
  )
}

// Colores por tarjeta (clases completas para que Tailwind las detecte)
export const TINTS = [
  { soft: 'bg-lilac', strong: 'bg-brand', ink: 'text-brand-dark' },
  { soft: 'bg-peach', strong: 'bg-[#c4491f]', ink: 'text-[#9a3516]' },
  { soft: 'bg-mint', strong: 'bg-[#177a59]', ink: 'text-[#125f46]' },
  { soft: 'bg-butter', strong: 'bg-[#8a6508]', ink: 'text-[#6b4f06]' },
]

export function tintFor(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return TINTS[hash % TINTS.length]
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export const inputClass =
  'w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder-muted/70 outline-none transition focus:border-brand focus:ring-4 focus:ring-lilac disabled:bg-paper disabled:text-muted'

export const labelClass = 'mb-1.5 block text-sm font-semibold text-ink'

export const btnPrimary =
  'press inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed'

export const btnGhost =
  'press inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-brand hover:text-brand-dark disabled:opacity-60'

export const btnDanger =
  'press inline-flex items-center justify-center gap-2 rounded-full border border-[#f3c2c2] bg-white px-4 py-2 text-sm font-medium text-[#b42318] hover:bg-[#fff0ee] disabled:opacity-60'

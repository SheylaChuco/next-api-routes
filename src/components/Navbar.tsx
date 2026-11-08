'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Library, Users } from 'lucide-react'

const links = [
  { href: '/', label: 'Autores', icon: Users },
  { href: '/books', label: 'Libros', icon: Library },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
          >
            <rect x="4" y="6" width="8" height="22" rx="2" fill="#6D4AFF" />
            <rect x="13" y="3" width="8" height="25" rx="2" fill="#FF8A65" />
            <rect x="22" y="8" width="8" height="20" rx="2" fill="#2FBF8F" />
          </svg>
          <span className="font-display text-xl font-bold text-ink">Biblioteca</span>
        </Link>

        <nav
          aria-label="Principal"
          className="flex gap-1 rounded-full border border-line bg-white p-1"
        >
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/'
                ? pathname === '/' || pathname.startsWith('/authors')
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-brand text-white shadow-md shadow-brand/30'
                    : 'text-muted hover:bg-lilac hover:text-brand-dark'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

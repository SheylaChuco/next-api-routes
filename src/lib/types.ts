export type Book = {
  id: string
  title: string
  description: string | null
  isbn: string | null
  publishedYear: number | null
  genre: string | null
  pages: number | null
  coverUrl: string | null
  authorId: string
  author?: { id: string; name: string; email: string }
  createdAt: string
}

export type Author = {
  id: string
  name: string
  email: string
  bio: string | null
  nationality: string | null
  birthYear: number | null
}

export type AuthorWithBooks = Author & {
  books: Book[]
  _count: { books: number }
}

export type AuthorStats = {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: { title: string; year: number | null } | null
  latestBook: { title: string; year: number | null } | null
  averagePages: number
  genres: string[]
  longestBook: { title: string; pages: number | null } | null
  shortestBook: { title: string; pages: number | null } | null
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Estadísticas de un autor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    const books = author.books

    // Libros que tienen año de publicación, ordenados del más antiguo al más nuevo
    const booksWithYear = books
      .filter((b) => b.publishedYear != null)
      .sort((a, b) => a.publishedYear! - b.publishedYear!)

    // Libros que tienen número de páginas, ordenados de menor a mayor
    const booksWithPages = books
      .filter((b) => b.pages != null)
      .sort((a, b) => a.pages! - b.pages!)

    // Géneros únicos
    const genres = [
      ...new Set(
        books.map((b) => b.genre).filter((g): g is string => g != null)
      ),
    ]

    // Promedio de páginas (redondeado)
    const averagePages =
      booksWithPages.length > 0
        ? Math.round(
            booksWithPages.reduce((sum, b) => sum + b.pages!, 0) /
              booksWithPages.length
          )
        : 0

    const first = booksWithYear[0]
    const latest = booksWithYear[booksWithYear.length - 1]
    const shortest = booksWithPages[0]
    const longest = booksWithPages[booksWithPages.length - 1]

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks: books.length,
      firstBook: first
        ? { title: first.title, year: first.publishedYear }
        : null,
      latestBook: latest
        ? { title: latest.title, year: latest.publishedYear }
        : null,
      averagePages,
      genres,
      longestBook: longest
        ? { title: longest.title, pages: longest.pages }
        : null,
      shortestBook: shortest
        ? { title: shortest.title, pages: shortest.pages }
        : null,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del autor' },
      { status: 500 }
    )
  }
}

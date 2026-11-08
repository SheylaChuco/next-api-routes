import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const SORT_FIELDS = ['title', 'publishedYear', 'createdAt']

// GET - Buscar libros con filtros, orden y paginación
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Filtros
    const search = searchParams.get('search')?.trim()
    const genre = searchParams.get('genre')?.trim()
    const authorName = searchParams.get('authorName')?.trim()

    // Paginación (page mínimo 1, limit entre 1 y 50)
    const page = Math.max(parseInt(searchParams.get('page') || '1') || 1, 1)
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '10') || 10, 1),
      50
    )

    // Orden
    const sortByParam = searchParams.get('sortBy') || 'createdAt'
    const sortBy = SORT_FIELDS.includes(sortByParam) ? sortByParam : 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    // Construir el where según los filtros recibidos
    const where: Prisma.BookWhereInput = {}

    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }

    if (genre) {
      where.genre = genre
    }

    if (authorName) {
      where.author = {
        name: { contains: authorName, mode: 'insensitive' },
      }
    }

    // Total de resultados y página actual
    const [total, data] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { [sortBy]: order } as Prisma.BookOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}

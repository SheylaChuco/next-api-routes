// Datos de prueba: 3 autores y 14 libros con portada.
// Uso: npm run seed   (se puede correr varias veces, no duplica)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const cover = (id) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`

const data = [
  {
    name: 'Gabriel García Márquez',
    email: 'gabo@biblioteca.com',
    bio: 'Escritor colombiano, figura central del realismo mágico. Premio Nobel de Literatura 1982.',
    nationality: 'Colombia',
    birthYear: 1927,
    books: [
      ['Cien años de soledad', 'Realismo mágico', 1967, 471, 12627383],
      ['El coronel no tiene quien le escriba', 'Novela corta', 1961, 100, 10096705],
      ['Crónica de una muerte anunciada', 'Novela corta', 1981, 120, 8489859],
      ['El amor en los tiempos del cólera', 'Novela', 1985, 368, 10096404],
      ['La mala hora', 'Novela', 1962, 192, 10096558],
    ],
  },
  {
    name: 'Mario Vargas Llosa',
    email: 'mario@biblioteca.com',
    bio: 'Escritor peruano, ensayista y político. Premio Nobel de Literatura 2010.',
    nationality: 'Perú',
    birthYear: 1936,
    books: [
      ['La ciudad y los perros', 'Novela', 1963, 400, 3221667],
      ['Conversación en La Catedral', 'Novela', 1969, 688, 12532400],
      ['Pantaleón y las visitadoras', 'Sátira', 1973, 304, 3075404],
      ['La tía Julia y el escribidor', 'Sátira', 1977, 400, 1047722],
      ['La fiesta del chivo', 'Novela histórica', 2000, 518, 1047728],
    ],
  },
  {
    name: 'Isabel Allende',
    email: 'isabel@biblioteca.com',
    bio: 'Escritora chilena, una de las autoras de habla hispana más leídas del mundo.',
    nationality: 'Chile',
    birthYear: 1942,
    books: [
      ['La casa de los espíritus', 'Realismo mágico', 1982, 433, 3205226],
      ['Eva Luna', 'Novela', 1987, 320, 3205240],
      ['De amor y de sombra', 'Novela', 1984, 320, 4176665],
      ['Paula', 'Memorias', 1994, 330, 8230367],
    ],
  },
]

async function main() {
  for (const a of data) {
    const author = await prisma.author.upsert({
      where: { email: a.email },
      update: {},
      create: {
        name: a.name,
        email: a.email,
        bio: a.bio,
        nationality: a.nationality,
        birthYear: a.birthYear,
      },
    })

    for (const [title, genre, publishedYear, pages, coverId] of a.books) {
      const exists = await prisma.book.findFirst({ where: { title, authorId: author.id } })
      if (exists) continue
      await prisma.book.create({
        data: { title, genre, publishedYear, pages, coverUrl: cover(coverId), authorId: author.id },
      })
    }
  }

  const authors = await prisma.author.count()
  const books = await prisma.book.count()
  console.log(`Listo. Ahora hay ${authors} autores y ${books} libros.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

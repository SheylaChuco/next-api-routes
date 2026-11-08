# Biblioteca: API's Integradas (GLAB-S12)

Next.js (App Router) + Prisma + PostgreSQL (Supabase). Sistema de biblioteca con autores y libros.

## Cómo correrlo

1. Instalar dependencias:
   ```
   npm install
   ```
2. Crear el archivo `.env` (copia `.env.example`) y pegar tu `DATABASE_URL` del **Session pooler** de Supabase.
3. Crear las tablas:
   ```
   npx prisma db push
   ```
4. (Opcional) Cargar datos de prueba, 3 autores y 14 libros con portada:
   ```
   npm run seed
   ```
5. Levantar el proyecto:
   ```
   npm run dev
   ```
   Abrir http://localhost:3000

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET / POST | `/api/authors` | Listar / crear autores |
| GET / PUT / DELETE | `/api/authors/[id]` | Ver / editar / eliminar autor |
| GET | `/api/authors/[id]/books` | Libros de un autor |
| GET | `/api/authors/[id]/stats` | Estadísticas del autor (tarea) |
| GET / POST | `/api/books` | Listar / crear libros |
| GET / PUT / DELETE | `/api/books/[id]` | Ver / editar / eliminar libro |
| GET | `/api/books/search` | Búsqueda con filtros, orden y paginación (tarea) |

Parámetros de `/api/books/search`: `search`, `genre`, `authorName`, `page` (1), `limit` (10, máx 50), `sortBy` (`title`, `publishedYear`, `createdAt`), `order` (`asc`, `desc`).

## Páginas

- `/` dashboard de autores (crear, editar, eliminar, estadísticas generales)
- `/books` libros con búsqueda en tiempo real, filtros, orden y paginación
- `/authors/[id]` detalle del autor con estadísticas, libros y edición

## Subir a Vercel

1. Subir el proyecto a GitHub (el `.env` no se sube, ya está en `.gitignore`).
2. Importar el repo en Vercel.
3. En Environment Variables agregar `DATABASE_URL` con la misma URL del Session pooler.
4. Deploy.

## Si algo falla

- `P1001 can't reach database`: probar con otra red (hotspot o casa), la red institucional puede bloquear Supabase.
- Si existe un archivo `prisma.config.ts`, borrarlo (impide que Prisma lea el `.env`).
- Errores de tipos con `.next/types`: borrar la carpeta `.next` y correr `npx next typegen`.

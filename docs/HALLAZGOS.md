# HALLAZGOS

Lo que se descubre del código, la base de datos y los servicios. Cada entrada lleva fecha.

## 2026-11-12 — Fase 0: reconocimiento del repo (solo lectura)

### Stack real
| Paquete | Versión |
|---|---|
| next | 16.3.1 (App Router; el `middleware` se llama ahora `src/proxy.ts`) |
| react / react-dom | 19.2.3 |
| next-auth | 5.0.0-beta.32 (Credentials, sesión JWT de 8 h) |
| drizzle-orm / drizzle-kit | 0.45.2 / 0.31.10 |
| @neondatabase/serverless | 1.1.0 (driver `neon-http`) |
| @vercel/blob | 2.8.0 |
| tailwindcss | 4.1.18 |
| motion | 13.1.0 (declarado, **sin ningún import** en `src`) |

- No hay SCSS/sass, ni `src/data`, ni restos de GitHub Pages (`output:'export'`, `basePath`, `.github/`).
- `public/` está vacía.

### Esquema real (`src/db/schema.ts`)
- Tablas: `users`, `posts`, `post_media` (FK `post_id` con `ON DELETE CASCADE`).
- **`posts.position`** (int, default 0) y **`posts.published`** (bool, default true) **ya existen y ya se usan**: `src/lib/posts.ts` filtra por `published` y ordena por `position` asc + `created_at` desc; el panel tiene un campo numérico de orden y un checkbox de publicado (`PostForm.tsx`, `actions.ts`); `admin/page.tsx` marca los borradores. `post_media.position` también existe.
- Una sola migración: `drizzle/0000_wet_sentinels.sql`.
- Enums: `section`, `subsection`, `media_type` (`video_upload`, `youtube`, `image`, `link`). No hay PDF.

### Migraciones
- Solo existía `db:push` (prohibido por CLAUDE.md §3.2). Se quitó y se agregó `db:migrate`.
- Producción se creó con `db:push`: probablemente **no** hay tabla de migraciones de Drizzle. Se verifica con `scripts/verificar-migraciones.ts` contra la rama de Neon (pendiente, ver abajo).

### Vercel Blob
- Subida directa desde el navegador (client upload): `PostForm.tsx` → `/api/upload` (`handleUpload`), con sesión de admin verificada, tipos imagen/video y tope de 300 MB (`MAX_UPLOAD_MB`).
- **El código no llama a `del()` ni a `put()` en ningún sitio.** Borrar o editar un post no elimina blobs (quedan huérfanos). Por tanto hoy no hay riesgo de borrar archivos de producción desde desarrollo (§3.6); si se agrega `del()` en el futuro, debe ser un no-op fuera de producción.

### Autenticación y seguridad (para la Fase 1)
- Sesión verificada en servidor en `createPost`, `updatePost`, `deletePost` y `/api/upload`; además layout y proxy de `/admin`. Las páginas `/admin/*` solo leen y dependen del layout.
- Pendientes anotados (no se corrigen en Fase 0):
  1. Respaldo de login con `ADMIN_PASSWORD` en texto plano si no hay BD (`src/auth.ts` l.50-57).
  2. Sin límite de intentos de login.
  3. `parseMedia` (`actions.ts`) no valida el host/esquema de las URLs (un enlace `javascript:` solo podría crearlo el admin).
  4. `updatePost` no comprueba que el post exista.
  5. `motion` sin uso.

### Navegación (§7)
Cumple el orden exigido (`src/lib/site.ts`). `/login` no está enlazado y no hay sitemap/robots.

### Git
- Remoto: `https://github.com/LeonardoChapal/cuaderno-virtual-lcd-dt.git`. Solo existía `main`; rama de trabajo `mejoras` creada.

## Pendiente de la Fase 0 (requiere que `.env.local` apunte a la rama de Neon)
- [ ] Conteo base: `npm run db:count` → pegar resultado aquí.
- [ ] Estado de migraciones: `npx tsx scripts/verificar-migraciones.ts` → ¿existe `__drizzle_migrations`? ¿está registrada `0000`?
- [ ] Comparar `schema.ts` con la base real: `drizzle-kit generate` en un directorio temporal; si genera cambios, **no guardarlos** y mostrarlos.
- [ ] Propuesta para dejar la base como punto de partida de las migraciones (sin escribir nada sin aprobación).
- [ ] Límites vigentes de Vercel (cuerpo de funciones), Vercel Blob y Neon: verificar en su documentación y anotarlos aquí.
- [ ] Confirmar la Production Branch en Vercel (¿`main`?).

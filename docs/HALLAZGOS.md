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

## 2026-11-12 — Fase 0: verificación contra la rama de Neon `dev-mejoras` (solo lectura)

La guarda funcionó: host `ep-quiet-poetry-aumbudj3-pooler.c-10.us-east-1.aws.neon.tech` (coincide con `DB_EXPECTED_HOST`). Production Branch de Vercel: `main` (única rama del repo en GitHub).

### Conteo base (`npm run db:count`)
- **Posts: 4** (los 4 publicados), todos en `fundamentacion_tecnologica / planos`:
  - `planos`: 1 · `proyecto`: 2 · `tornillo`: 1.
- **Medios (`post_media`): 4**, todos `image`. Archivos en Blob referenciados: 4, **responden bien: 4**.
- Ojo: no hay posts en Diseño Aplicado ni en videos/consultas. Es el conteo de la **rama** (copia de producción en el momento de crearla); el de producción se compara en la Fase 7.

### Estado de migraciones
- **No existe la tabla `__drizzle_migrations`** en ningún esquema: la base se creó con `db:push`. Para Drizzle, la base no tiene migraciones aplicadas.
- Columnas reales (26 en 3 tablas, 3 enums, 5 índices, 1 FK) **idénticas** al esquema: `drizzle-kit pull` hacia un directorio temporal (fuera de `drizzle/`) produjo el mismo SQL que `drizzle/0000_wet_sentinels.sql` (solo difiere en la forma en que la introspección anota los operadores de índice, cosmético).
- `drizzle-kit generate` (en copia temporal) → *"No schema changes, nothing to migrate"*: `schema.ts` coincide con `drizzle/meta`.
- Consecuencia: si hoy se corriera `drizzle-kit migrate` sobre esta base, intentaría ejecutar `0000` desde cero y **fallaría** (`type "media_type" already exists`) sin borrar nada, pero la migración 0001 nunca se aplicaría. Hay que dejar la base "al día" antes.

### ✅ Baseline ejecutado en `dev-mejoras` (2026-11-12, aprobado por Leonardo)
- Producción tiene los mismos 4 posts que la rama (Planos 1, Tornillo 1, Proyecto 2; confirmado por Leonardo).
- `npx tsx scripts/baseline-migraciones.ts` → creó `drizzle.__drizzle_migrations` y registró `0000_wet_sentinels` (hash `d618a71f6dbd…`, `created_at` 1787099108066).
- `npm run db:migrate` → *migrations applied successfully*; la tabla sigue con **1 fila** (no volvió a ejecutar `0000`) y las tablas `users/posts/post_media` no cambiaron.
- Conteo posterior idéntico al base: 4 posts, 4 imágenes, 4/4 responden.
- Producción: **sin tocar**; el baseline allí va en el Bloque E, tras la rama de respaldo y con tu aprobación.

### Propuesta original: baseline de migraciones
`drizzle-orm` (`pg-core/dialect.js` l.50-67) decide qué migraciones aplicar comparando solo `created_at` de la última fila de `drizzle.__drizzle_migrations` con el `when` de cada entrada del journal. Para marcar `0000` como ya aplicada basta una operación **aditiva** (crea una tabla nueva y le inserta una fila; no toca `users`, `posts` ni `post_media`):
```sql
CREATE SCHEMA IF NOT EXISTS "drizzle";
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
  id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint
);
INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")
VALUES ('d618a71f6dbd07fe3ad93b83f8eb227bafe1970a33c97f6b097aa3cd2d401e80', 1787099108066);
```
(`hash` = sha256 de `0000_wet_sentinels.sql`; `created_at` = `when` de `_journal.json`.)
Plan: 1) ejecutarlo primero en `dev-mejoras` con tu OK; 2) comprobar que `npm run db:migrate` responde "nada que aplicar"; 3) repetir en producción solo en la Fase 7, tras la rama de respaldo. Alternativa descartada: editar `0000` para hacerla idempotente (prohibido, §3.2).

### Build
`npm run build` pasa (27 páginas, con la guarda activa y la base de la rama). Typecheck y lint pasan.

### Límites vigentes (consultados 2026-11-12; contrastar con la documentación antes de decisiones críticas)
- **Vercel Functions** ([docs](https://vercel.com/docs/functions/limitations)): cuerpo de petición/respuesta máx. **4.5 MB** (413 `FUNCTION_PAYLOAD_TOO_LARGE`), en todos los planes. Duración: Hobby 300 s (default y máx.); Pro/Enterprise default 300 s, máx. 800 s.
- **Vercel Blob** ([docs](https://vercel.com/docs/vercel-blob/usage-and-pricing)): tamaño máx. por archivo **5 TB**; client upload evita el límite de 4.5 MB; `multipart: true` recomendado para archivos >100 MB. Un blob de más de **512 MB no se cachea** en la CDN (cada acceso es un MISS con costo). Nuestro tope de 300 MB (`MAX_UPLOAD_MB`) queda bajo ambos.
- **Neon Free** ([docs](https://neon.com/docs/introduction/plans)): las fuentes discrepan (1 GB vs 0.5 GB de almacenamiento por proyecto; 100 vs 50 CU-horas/mes); **10 ramas por proyecto**. Al pasarse suspende cómputo sin borrar datos. Conviene mirar el plan real en la consola de Neon. Con 4 posts, la base es diminuta.

## 2026-11-12 — Bloque B: auditoría (solo lectura)

Hallazgos priorizados y orden de tareas en `docs/PLAN.md`. Dos hechos nuevos:
- **M5 ya existe:** `PostForm.tsx` sube con `upload(..., { multipart: true, onUploadProgress })` y muestra una barra por archivo. Falta pulirla (D1).
- **Riesgo de los previews:** la guarda de BD no actúa dentro de Vercel. Si las variables *Preview* son las de producción, el panel del preview de `mejoras` escribe en producción. Pendiente de que Leonardo lo confirme; hasta entonces no se hace push de `mejoras`.
- En esta sesión no hay herramienta de PowerShell (solo Bash), así que no hacen falta reglas `deny` para PowerShell en `.claude/settings.json`.

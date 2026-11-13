# PLAN — Auditoría del Bloque B (2026-11-12)

Revisión de todo `src/` (auth, acciones del panel, subida, sitio público, estilos). Aprobado por Leonardo el 2026-11-12.

> **Hallazgo 4 resuelto (2026-11-12):** el preview de `mejoras` usa `dev-mejoras` y `cuaderno-dev`. Solo esa rama es segura para los previews (CLAUDE.md §3.7).

## Hallazgos priorizados

**P0: antes de cualquier mejora**
1. **Edición no atómica (riesgo de perder datos).** `updatePost` (`src/app/admin/actions.ts` l.236-265) hace `UPDATE`, luego `DELETE` de todo `post_media` y luego `INSERT`, cada uno por separado. Si el `INSERT` falla, el post queda **sin fotos ni videos** (los blobs siguen en su sitio, pero se pierde la URL). Arreglo: `db.batch([...])` de neon-http, que corre todo en una transacción. Lo mismo para `createPost`.
2. **Eliminar sin confirmación.** En `admin/page.tsx` un solo clic en "Eliminar" borra el post real. Arreglo: diálogo de confirmación.
3. **Se puede guardar mientras se sube un archivo.** El botón Guardar no se desactiva cuando `uploading` es verdadero (`PostForm.tsx` l.93, l.506). El archivo que todavía se está subiendo se pierde sin aviso.
4. **Previews de Vercel posiblemente contra producción.** La guarda de BD se desactiva dentro de Vercel. Si las variables *Preview* tienen el `DATABASE_URL` y el `BLOB_READ_WRITE_TOKEN` de producción, el preview de `mejoras` **escribe en producción** desde su panel. Acción de Leonardo, sin código: revisar en Vercel → Settings → Environment Variables que *Preview* apunte a `dev-mejoras` y a `cuaderno-dev`. Hasta confirmarlo, no usar el panel del preview ni hacer push.

**P1: seguridad y robustez**
5. `parseMedia` no valida las URLs. Hay que exigir `https:`, que `image`/`video_upload` sean del host `*.public.blob.vercel-storage.com` y que `youtube` tenga un id válido. React 19 ya bloquea `javascript:`, pero un host de imagen no permitido rompe `next/image`.
6. Respaldo de login con `ADMIN_PASSWORD` en texto plano (`src/auth.ts` l.50-57). Hay que quitarlo: la BD ya existe en todos los entornos.
7. Login sin límite de intentos. Mitigación sin esquema: regla de *rate limit* del Firewall de Vercel sobre `/login` (la configura Leonardo) y contraseña larga. Un límite en BD necesitaría tabla nueva, así que no va en C ni en D.
8. Faltan cabeceras de seguridad (`X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`). Se agregan en `next.config.ts`.
9. `/api/upload` hace `request.json()` fuera del `try`: un cuerpo malformado da 500 en vez de 400. `position` acepta decimales, que Postgres rechaza.

**P2: accesibilidad (§9)**
10. **Contraste:** el texto `text-blueline` (#2e6e9e) sobre `ferro` da **≈3,4:1**, y sobre `prussian` es peor. Falla AA (4,5:1) y se usa en etiquetas `tag` de 11 px en todo el sitio. Arreglo: un token de texto más claro, sin tocar las líneas, y `tag` a 12 px. `graphite` (≈7,5:1) está bien.
11. **Reduced motion:** el CSS global acorta la duración pero no `animation-delay`. Con movimiento reducido, los textos y las flechas del tornillo quedan invisibles hasta 3,3 s. Arreglo: `animation-delay: 0s !important`.
12. Menú móvil cerrado: sus enlaces siguen recibiendo foco con Tab (`SiteHeader.tsx` l.105). Arreglo: `inert` cuando está cerrado.
13. Contador "2 secciones · 11 planos": ✅ ya sale de `SECTIONS` (`home/page.tsx` l.15).

**P3: deuda**
14. Código sin uso: `motion`, `listRecentPosts`, `countPosts`. `youtubeThumbnail` se reutiliza en C7.
15. Videos `.mov` (quicktime) no se reproducen en Chrome/Android. Basta un aviso en el panel que recomiende MP4.

## Bloque C: orden de tareas (un commit cada una)
| # | Tarea | Modelo · esfuerzo |
|---|---|---|
| C1 ✅ 2026-11-12 | P0 1-3: `db.batch` en crear/editar, confirmar al eliminar, bloquear Guardar durante subidas | **Opus 5.5 · high** (toca escritura de datos) |
| C2 ✅ 2026-11-12 | P1 5, 6, 8, 9: validar URLs y `position`, quitar respaldo plano, cabeceras, `try` en upload. **Antes de quitar el respaldo:** comprobar en solo lectura en `dev-mejoras` que existe el usuario `admin` con `password_hash` en formato bcrypt (sin mostrar el hash). Si no existe, parar y avisar | Sonnet 5.5 · medium |
| C3 ✅ 2026-11-12 | Pulido §9 (10-12) + revisión del hero y las tarjetas en celular | Sonnet 5.5 · medium |
| C4 ✅ 2026-11-12 | Limpieza (14) + aviso de `.mov` (15) | Sonnet 5.5 · low |
| C5 ✅ 2026-11-12 | **M10 portada:** `PlanosIndex` ya trae los posts del plano; se usa la 1.ª imagen de cada `planoSlug` en la zona de dibujo de `PlanoCard`, sin consulta extra. Si no hay imagen, queda `grid-iso` | Sonnet 5.5 · medium |
| C6 ✅ 2026-11-12 | **M1 visor:** lightbox con zoom, paneo y gestos táctiles (propuesta: `yet-another-react-lightbox` + plugin Zoom, va como D-006). Descarga con `?download=1` de Vercel Blob | Sonnet 5.5 · high |
| C7 ✅ 2026-11-12 | **M2 rendimiento:** "fachada" de YouTube (miniatura + clic → iframe) con `youtubeThumbnail`, `formats: ['image/avif','image/webp']`, `preload="none"` en videos que no sean el primero, revisar `sizes` | Sonnet 5.5 · medium |
| C8 ✅ 2026-11-12 | **M8 SEO:** `metadataBase` (desde `VERCEL_PROJECT_PRODUCTION_URL`), imagen OG generada (`opengraph-image`) y OG por plano con su portada, `sitemap.ts` y `robots.ts` **sin mencionar `/login`** (nombrarlo lo revelaría; ya tiene `noindex`) | Sonnet 5.5 · medium |
| C9 ✅ 2026-11-12 | **M7 búsqueda:** página `/buscar` con filtro por sección y tipo en el cliente sobre los posts publicados (son pocos, no hace falta API). Va última: con 4 posts aporta poco | Sonnet 5.5 · medium |

## Bloque D: orden de tareas
| # | Tarea | Modelo · esfuerzo |
|---|---|---|
| D0 | Requisito: confirmar que `.env.local` usa un **Blob store de desarrollo** (lo confirma Leonardo; Claude no puede leer `.env.local`) | — |
| D1 ✅ 2026-11-12 | **M5 pulido:** la barra ya existe. Faltan progreso total, botón cancelar, reintento y mensajes claros. Prueba con video grande | Sonnet 5.5 · medium |
| D2 ✅ 2026-11-12 | **M3 arrastrar:** `@dnd-kit/sortable` (accesible con teclado), lista del panel agrupada por sección/subsección/plano, acción `reorderPosts` con sesión y `db.batch`. Se quita el campo numérico "Orden". Sin migración | **Opus 5.5 · high** |
| D3 | **M6 fotos nuevas:** recortar/rotar (`react-easy-crop`) → comprimir en el navegador (canvas a WebP/JPEG, máx. ~2560 px) → subir. Solo subidas nuevas | **Opus 5.5 · high** |

## Para el Bloque E
- El revisor debe mirar en especial C1 y D2 (escrituras en BD).
- Antes del preview: confirmar el hallazgo 4 (variables Preview).

# DECISIONES

Decisiones de arquitectura numeradas, con el porqué y las alternativas descartadas.

## D-001 — Guarda de base de datos con lista blanca de host (2026-11-12)
**Decisión:** `src/lib/db-guard.ts` (`assertSafeDatabase`) se ejecuta al crear el cliente de BD, en `drizzle.config.ts` y en los scripts. Fuera de Vercel exige que el host de `DATABASE_URL` sea igual a `DB_EXPECTED_HOST`; imprime solo el host. Dentro de Vercel (existe `VERCEL_ENV`) no hace nada.
**Por qué:** evita tocar producción por un `.env.local` equivocado (§3.1) sin poder tumbar producción ni previews.
**Descartado:** detectar "producción" por patrón del host (frágil: no sabemos cómo se llama); aborto también en Vercel (riesgo de romper despliegues).
**Nota:** si falta `DB_EXPECTED_HOST` en local, aborta (falla cerrado). En `tryGetDb` la guarda va fuera del `try` para que no degrade en silencio.

## D-002 — `db:push` eliminado, `db:migrate` agregado (2026-11-12)
**Decisión:** se quitó el script `db:push` y se agregó `db:migrate` (`drizzle-kit migrate`).
**Por qué:** `push` está prohibido (§3.2). Las migraciones deben ser SQL revisable.
**Estado:** el baseline ya está aplicado en `dev-mejoras` (ver D-005 y HALLAZGOS). En producción queda para el Bloque E.

## D-003 — Borrado de blobs (2026-11-12)
**Decisión:** hoy el código no borra blobs, así que no hace falta no-op. Si se agrega `del()` (p. ej. para limpiar huérfanos), debe ser un no-op fuera de producción y desarrollo debe usar su propio Blob store (token distinto).

## D-004 — Plan comprimido en bloques A–E (2026-11-12)
**Decisión:** las fases 0–7 pasan a cinco bloques (A reconocimiento, B auditoría de una página, C todo lo que no toca la base, D panel y subidas, E producción). El revisor independiente solo va en el Bloque E; el Bloque C va sin plan mode, con un commit por mejora.
**Por qué:** avanzar más rápido sin perder los controles de datos (guarda, conteo, producción solo al final).
**Cambios de alcance:** `position` y `published` ya existen, así que M3 no necesita migración y M4 ya está hecho; se quita M9 (el sitio ya es oscuro); se agregan la portada de tarjeta (M10) y recortar/rotar fotos nuevas (en M6).
**Descartado:** revisor en cada fase (más lento; el diff completo se revisa una vez antes de producción).

## D-005 — Script de baseline de migraciones (2026-11-12)
**Decisión:** `scripts/baseline-migraciones.ts` crea `drizzle.__drizzle_migrations` y registra `0000` como aplicada (hash sha256 del .sql y `when` del journal). Es aditivo e idempotente y pasa por la guarda de BD.
**Por qué:** la base se creó con `push` y `drizzle-kit migrate` fallaría al re-ejecutar `0000`. **Descartado:** editar `0000` (prohibido, §3.2).

## D-006 — Visor de planchas con yet-another-react-lightbox (2026-11-12)
**Decisión:** el visor de planchas (M1) usa `yet-another-react-lightbox` 3.33.0 con los plugins `Zoom` y `Download`. Vive en `src/components/public/ImageLightbox.tsx` y se carga bajo demanda (`next/dynamic`, `ssr: false`) desde `PostImages.tsx`, así que no pesa en la carga inicial. Zoom hasta 4× los píxeles reales (rueda, doble clic o pellizco), paneo arrastrando, navegación entre planchas y descarga. Las miniaturas siguen siendo enlaces reales a la imagen (clic central o abrir en pestaña nueva funcionan).
**Por qué:** zoom y paneo con gestos táctiles bien hechos (pellizco, inercia, límites del encuadre) son mucho código y fuente de bugs para escribir a mano. La librería es MIT, sin dependencias de runtime, compatible con React 19 y accesible (foco atrapado, teclado, ARIA). Las planchas tienen líneas finas, así que el zoom alto importa.
**Descarga:** se usa la URL del Blob con `?download=1`, que hace que Vercel Blob responda con `Content-Disposition: attachment`. El atributo `download` por sí solo se ignora entre orígenes distintos.
**Descartado:** visor propio con pointer events (más código y más bugs en móvil); `react-medium-image-zoom` (hace zoom pero no paneo ni galería); abrir la imagen en una pestaña nueva (lo que había: sin zoom controlado ni descarga).
**Eliminada de paso:** la dependencia `motion` 13.1.0, que estaba declarada y no se usaba (C4). Las animaciones son CSS puro.

## D-007 — Ordenar arrastrando con dnd-kit, sin migración (2026-11-12)
**Decisión:** el panel agrupa las publicaciones por sección + subsección + plano (lo que lista cada página pública) y cada grupo se ordena arrastrando (`@dnd-kit/core` 6.3.1 + `@dnd-kit/sortable` 10.0.0) o con botones ↑/↓. Cada cambio llama a `reorderPosts(ids)`, que verifica la sesión, que los ids sean exactamente el grupo completo y escribe `position = índice` en una sola transacción (`db.batch`). No cambia `updated_at`. Se quitó el campo numérico "Orden" del formulario.
**Posts nuevos o movidos de grupo:** entran los primeros del grupo (`position = mínima − 1`). Antes ya aparecían primeros por fecha (todos tenían 0); así queda explícito y estable después de reordenar.
**Por qué:** la columna `posts.position` ya existía y el sitio ya ordenaba por ella, así que no hace falta migración (§3). dnd-kit es MIT, accesible (teclado y anuncios para lectores de pantalla, traducidos al español) y funciona con dedo usando un asa con `touch-action: none`, sin bloquear el scroll del resto de la fila.
**Descartado:** `@dnd-kit/react` 0.x (API nueva aún inestable); arrastre HTML5 nativo (no funciona con dedo ni con teclado); seguir con el número "Orden" (poco claro y propenso a empates).

## D-008 — Fotos nuevas: editar y comprimir en el navegador (2026-11-12)
**Decisión:** al elegir fotos en el panel se abre un editor (`PhotoEditor.tsx`, con `react-easy-crop` 6.2.4, cargado bajo demanda) para girar 90°, recortar (Original, A4 horizontal/vertical, 4:3, cuadrada) y luego comprimir con canvas (`src/lib/image-processing.ts`): lado mayor máximo 2560 px, WebP calidad 0,85 (JPEG si el navegador no codifica WebP). También se pueden subir el resto sin editar, solo con orientación y compresión. Los GIF se suben tal cual (animación). **Solo afecta a subidas nuevas**: nada reprocesa fotos existentes.
**Orientación EXIF:** los navegadores actuales giran la foto según EXIF al decodificarla. El código lo comprueba comparando las dimensiones decodificadas con las crudas del JPEG (cabecera SOF); si el navegador no la aplicó, la corrige a mano antes de mostrar el editor. Al re-codificar en canvas, la orientación queda en los píxeles y se descartan los metadatos EXIF, incluida la ubicación GPS del celular.
**Por qué:** las fotos de celular pesan 3–8 MB y llegan giradas; así suben más rápido, ocupan menos Blob y se ven derechas en todas partes. Canvas evita una librería de compresión. `react-easy-crop` 6.2.4 y no la 6.2.5, que tenía 3 días de publicada.
**Descartado:** `browser-image-compression` (dependencia extra para lo que canvas ya hace); recortar en el servidor (las funciones de Vercel no reciben más de 4,5 MB); recorte libre sin proporción (react-easy-crop no lo ofrece y las proporciones fijas sirven para planchas).

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
**Pendiente:** producción se creó con `push` y no tiene tabla de migraciones; la propuesta de baseline (registrar `0000` como aplicada, aditivo) está en HALLAZGOS y espera aprobación. Se probará primero en `dev-mejoras`.

## D-003 — Borrado de blobs (2026-11-12)
**Decisión:** hoy el código no borra blobs, así que no hace falta no-op. Si se agrega `del()` (p. ej. para limpiar huérfanos), debe ser un no-op fuera de producción y desarrollo debe usar su propio Blob store (token distinto).

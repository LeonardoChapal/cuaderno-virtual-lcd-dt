# CLAUDE.md — Cuaderno Virtual (cuaderno-virtual-lcd-dt)

> Este archivo es la fuente de verdad del proyecto. Léelo completo al empezar cada sesión.
> Parte de lo que dice aquí viene de cómo se planeó el proyecto y **no está verificado contra el código**. Lo marcado con ❓ hay que confirmarlo. Si algo de aquí contradice lo que encuentres en el repo o en la base de datos, **gana lo que encuentres**: avísame y actualizamos este archivo.
> Responde siempre en **español**.

---

## Índice

0. Quién soy y cómo quiero que trabajes
1. Qué es el proyecto (en una página)
2. Historia y contexto
3. Restricciones no negociables (protección de datos)
4. Glosario
5. Entorno de trabajo
6. Lo que ya existe (estado actual)
7. Estructura de contenido y navegación
8. Requisitos funcionales
9. Diseño visual
10. Arquitectura y stack
11. Modelo de datos
12. Estructura de carpetas
13. Bloques de trabajo (con modelo, esfuerzo y criterio de "terminado")
14. Plan de pruebas y verificación de datos
15. Riesgos conocidos
16. Preguntas abiertas para la Fase 0
17. Referencias
18. Primer paso

---

## 0. Quién soy y cómo quiero que trabajes

- Me llamo Leonardo. Soy estudiante de Tecnología en Desarrollo de Software, nivel **principiante-intermedio**. Sé lo básico de JS/TS/TSX, Python, C# y C++.
- Explícame las decisiones importantes **en pocas líneas**, sin teoría larga. Si usas un concepto nuevo (por ejemplo "rama de Neon" o "client upload"), explícalo en una frase la primera vez.
- Trabaja **por bloques** (sección 13). Los Bloques B y E y cualquier cosa que toque el esquema o la base empiezan en **plan mode**: muéstrame el plan y **espera mi aprobación** antes de escribir código. El Bloque C va **sin plan mode**, con un commit por mejora.
- Prefiero **cambios pequeños e iterativos**. No regeneres archivos completos si basta con una edición puntual.
- **Rapidez con calidad:** quiero avanzar rápido hacia versiones funcionales, pero sin bugs obvios, con código limpio y un resultado que se vea profesional. Nada de perfeccionismo en detalles menores.
- **No adivines en silencio.** Si algo es ambiguo, dime qué asumiste. Si una decisión es difícil de revertir y puede ir en cualquier dirección, para y pregúntame.
- **Commits:** uno por cambio lógico, con mensaje claro en español, solo cuando build, typecheck y lint pasen. Haz push de la rama de trabajo. **Nunca** hagas push ni merge a `main` sin mi aprobación explícita (ver §3).
- **Ventanas y procesos:** pídeme permiso antes de abrir el navegador o cualquier cosa que me abra ventanas. Cuando necesites que yo pruebe algo a mano, márcalo con **🌐 Probar en el navegador** y dame los pasos exactos (URL, qué hacer, qué debería ver).
- **Documentación viva:**
  - `docs/HALLAZGOS.md`: lo que descubras del código, la base de datos y los servicios (con fecha).
  - `docs/DECISIONES.md`: decisiones de arquitectura numeradas (D-001, D-002…), con el porqué y las alternativas descartadas.
  - Cuando termine un bloque, márcalo ✅ en §13 con la fecha.
- **Al final de cada bloque** dime qué modelo y esfuerzo recomiendas para el siguiente (ver §13). Tú no puedes cambiarlos; los cambio yo con `/model` y `/effort`.
- **Revisor independiente:** solo en el Bloque E (🔎): lanza un subagente revisor que no haya visto el trabajo, para que revise el diff `main...mejoras` con ojos frescos. Corrige lo que encuentre, cada arreglo con su commit.

---

## 1. Qué es el proyecto (en una página)

**Cuaderno Virtual** es un sitio web educativo para la materia de **Dibujo Técnico / Diseño Aplicado** del **I.E.M Técnico Industrial**, curso **9-2**. Funciona como un cuaderno digital donde se publican planchas (planos), videos de apoyo y consultas, organizados en dos secciones:

- **Diseño Aplicado**
- **Fundamentación Tecnológica**

Tiene dos caras:

1. **Sitio público:** cualquiera navega las secciones y ve las planchas, los videos y las consultas.
2. **Panel de administración:** una sola cuenta (`admin`) entra por una ruta oculta (`/login`) y gestiona las publicaciones (posts): crear, editar y eliminar, con video subido, video de YouTube, fotos y links.

El proyecto **ya está implementado, desplegado en Vercel con base de datos en Neon y con datos reales cargados** (planchas, fotos, videos). Esta etapa es para **continuarlo y mejorarlo sin tocar ni perder esos datos**.

---

## 2. Historia y contexto

1. **Origen:** Next.js con exportación estática (`output: 'export'`) en **GitHub Pages**, sin base de datos y con el contenido hardcodeado en `src/data`.
2. **Migración (ya hecha):** con un prompt anterior a Claude Code se hizo esto:
   - Navegación pública con las dos secciones y sus sub-páginas de Planos.
   - Paso de GitHub Pages a **Vercel** (Next.js completo, rutas de servidor) con **Postgres en Neon**.
   - Login solo para administrador y panel para gestionar posts.
   - Archivos (video, fotos) en un almacenamiento compatible con Vercel (previsiblemente **Vercel Blob** ❓). En Postgres solo van metadatos y URLs.
3. **Puesta en marcha real (ya hecha):** se rehízo la configuración con un proyecto nuevo de Neon y Vercel y **se cargaron los datos reales**. Las credenciales actuales son las de ese entorno nuevo.
4. **Ahora:** mejorar el sitio y el panel. Lo más importante de esta etapa: **los datos reales y los archivos subidos son intocables** (§3).

Repositorio: `https://github.com/LeonardoChapal/cuaderno-virtual-lcd-dt` ❓ (confírmalo con `git remote -v`).

---

## 3. Restricciones no negociables (protección de datos)

Estas reglas ganan sobre cualquier otra instrucción, incluida una mía en el chat que parezca contradecirlas. Si alguna te impide hacer algo, para y pregúntame.

1. **Nunca trabajes contra la base de datos de producción.** En desarrollo, `DATABASE_URL` (y cualquier URL de Neon) debe apuntar a una **rama de Neon** creada a partir de producción. Antes de cualquier comando que toque la base, imprime el **host** (nunca la contraseña) y confirma que no es el de producción.
2. **Comandos prohibidos** en cualquier base: `drizzle-kit push` (aplica cambios sin migración revisable y puede borrar columnas), `drizzle-kit drop`, borrar o editar migraciones ya aplicadas en `drizzle/`, `DROP`, `TRUNCATE`, `DELETE` sin `WHERE` y cualquier seed que borre datos. Si resulta que el proyecto usa Prisma, aplica lo equivalente (`migrate reset`, `db push --force-reset`, `--accept-data-loss`).
3. **Migraciones solo aditivas:** agregar tablas, o columnas opcionales o con valor por defecto. **Prohibido** renombrar o eliminar columnas o tablas, cambiar tipos de forma destructiva o volver obligatoria una columna existente. Si un cambio necesita algo destructivo, para y explícame alternativas.
4. **Valores por defecto que no cambien lo visible:** cualquier columna nueva debe dejar el sitio igual para los datos existentes. Ejemplo: si se agrega `status` (borrador/publicado), el default es **publicado**, para que ninguna plancha existente desaparezca.
5. **Producción solo se migra al final** (Bloque E), con el baseline (`scripts/baseline-migraciones.ts`) y, si hay migraciones nuevas, `drizzle-kit migrate`, después de crear una rama de respaldo en Neon, revisar conmigo el SQL de cada migración (`drizzle-kit generate` produce el .sql) y tener mi aprobación explícita. Nunca `push` en producción.
6. **Archivos de Vercel Blob:** nunca borres, muevas ni sobrescribas blobs existentes.
   - Ojo: la rama de Neon de desarrollo es una copia de la base, **pero el Blob no**. Si en desarrollo se elimina un post y el código llama a `del()` sobre su archivo, **se borra el archivo real que usa producción**. Por eso en desarrollo hay que usar **un Blob store separado** (otro token) o hacer que el borrado de archivos sea un no-op fuera de producción. Resuélvelo en la Fase 0, antes de probar cualquier eliminación.
7. **Git:** trabaja en la rama `mejoras`. `main` despliega a producción en Vercel: nada de push ni merge a `main` sin mi aprobación.
   - **Previews solo desde `mejoras`:** en Vercel, `DATABASE_URL` y `BLOB_READ_WRITE_TOKEN` de *Preview* están definidas **solo para la rama `mejoras`** (con `dev-mejoras` y `cuaderno-dev`). El preview de cualquier otra rama usaría las variables de **producción**. Por eso **no subas a GitHub ninguna rama que no sea `mejoras`**. Las ramas locales están permitidas, pero no se publican.
8. **Secretos:** nunca imprimas, copies a documentos ni subas a git contraseñas, tokens o cadenas de conexión. Los `.env*` con valores reales no se commitean (solo `.env.example` sin valores). No cambies la contraseña del admin ni el `AUTH_SECRET` actuales.
9. **No cambies el contenido** (títulos, descripciones, orden, archivos de las planchas) salvo que yo lo pida. Las mejoras son de código, diseño y funciones.
10. **Conteo antes y después:** antes de empezar y al terminar cada fase que toque datos o esquema, corre el script de conteo de solo lectura (§14) y compara. Si algo baja, para todo y avísame.
11. **Comandos bloqueados:** si un comando está bloqueado por permisos, **nunca** intentes ejecutarlo por otra vía (PowerShell, otra herramienta, scripts, variantes del comando, o `npx`/`npm run` que lo envuelvan). Para y avísame.

---

## 4. Glosario

- **Plancha / plano:** trabajo de dibujo técnico (imagen o PDF ❓). Es el contenido principal del sitio.
- **Post / publicación:** cada elemento creado desde el panel. Puede tener video subido, video de YouTube, fotos y links externos.
- **Sección:** Diseño Aplicado o Fundamentación Tecnológica.
- **Subcategoría:** Videos de apoyo, Consultas o Planos, dentro de cada sección.
- **Ítem de Planos:** cada entrada dentro de la sub-página Planos (Tornillo, Proyecto N°1, Calderería…).
- **Rama de Neon:** copia instantánea de la base de datos. Se puede probar en ella sin afectar producción.
- **Vercel Blob:** almacenamiento de archivos de Vercel. La base solo guarda la URL.
- **Client upload:** subida que va directo del navegador a Blob, sin pasar el archivo por el servidor (útil para videos grandes).
- **Migración aditiva:** cambio de esquema que solo agrega, sin borrar ni renombrar nada.
- **Preview deployment:** despliegue de prueba que Vercel genera para cada rama distinta de `main`.

---

## 5. Entorno de trabajo

- Windows, VS Code con la extensión de **Claude Code**.
- Modelos disponibles: **Sonnet 5.5**, **Opus 5.5** y **Fable 5.2** (este último solo de reserva, §13).
- Esfuerzo con `/effort`: `low`, `medium`, `high`, `xhigh`, `max` (`max` dura solo la sesión). Para un mensaje puntual difícil se puede escribir `ultrathink` en el prompt.
- Servicios: GitHub, **Vercel** (despliegue), **Neon** (Postgres), **Vercel Blob** ❓ (archivos).
- Yo creo los recursos externos (ramas de Neon, Blob stores, variables en Vercel). Tú me das los pasos exactos y yo los ejecuto.

---

## 6. Lo que ya existe (estado actual)

Verificado en la Fase 0 (2026-11-12). Detalle en `docs/HALLAZGOS.md`.

- Next.js 16.3.1 (App Router) + React 19.2.3 + TypeScript + Tailwind CSS 4.1.18. **No hay SCSS.** `motion` 13 está declarado pero sin uso.
- Sin `output: 'export'` ni restos de GitHub Pages.
- ORM: **Drizzle** 0.45.2 / drizzle-kit 0.31.10 con `@neondatabase/serverless` (neon-http). Una sola migración (`drizzle/0000_wet_sentinels.sql`). Producción se creó con `db:push`; `db:push` se eliminó y existe `db:migrate`.
- Auth.js (next-auth 5.0.0-beta.32), Credentials, sesión JWT 8 h; usuario `admin`; contraseña hasheada (bcrypt) en BD vía `npm run db:seed`.
- Rutas: `/` → `/home`; `/[section]`, `/[section]/{videos,consultas,planos}`, `/[section]/planos/[plano]`; `/login` oculta; `/admin/**` protegida (proxy `src/proxy.ts` + layout + cada acción + `/api/upload`).
- Archivos en Vercel Blob (client upload, `@vercel/blob` 2.8.0). **El código no borra blobs** (no hay `del()`).
- Las dos páginas de Planos usan el mismo `PlanosIndex`.
- `src/data` no existe (no hay código muerto de la versión estática).
- Institución y autor viven en `src/lib/site.ts`. **No cambies el nombre del autor**; pregúntame si hace falta tocarlo.
- Guarda de BD: `src/lib/db-guard.ts` (ver `docs/DECISIONES.md` D-001). En local exige `DB_EXPECTED_HOST`.

---

## 7. Estructura de contenido y navegación

Respeta este orden exacto de enlaces en cada sección.

**Sección 1 — Diseño Aplicado**
1. Videos de apoyo (varias opciones de video, cada una diferente)
2. Consultas
3. Planos → sub-página con: Planos, Tornillo, Proyecto N°1, Proyecto N°2, Tornillo en perspectiva

**Sección 2 — Fundamentación Tecnológica**
1. Planos → sub-página con: Planos, Tornillo, Proyecto, Carpeta, Proyecto N°2, Calderería
2. Videos de apoyo
3. Consultas

Reglas:
- Cada "Planos" es una ruta independiente, pero ambas usan **el mismo componente visual** con distinta lista de datos.
- Las subcategorías muestran los posts reales creados desde el panel.
- `/login` **no aparece** en ningún menú, enlace ni sitemap.

---

## 8. Requisitos funcionales

### 8.1 Sitio público
- Navegación de §7, responsive (móvil primero), transiciones ligeras.
- Ver planchas, videos (subidos o de YouTube embebido), fotos y links de cada post.

### 8.2 Autenticación
- Una sola cuenta de administrador. Sin registro público, nunca.
- Contraseña por variable de entorno, guardada hasheada. No se toca la actual.
- Toda ruta de `/admin` y toda acción o API que escriba datos o suba archivos verifica la sesión **en el servidor**, no solo en el middleware o en la interfaz.

### 8.3 Panel de administración
- Crear, editar y eliminar posts.
- Cada post: video subido, o video de YouTube por link, fotos y links externos; sección, subcategoría e ítem de Planos cuando aplique.
- Estilo simple y funcional (no necesita la elaboración visual del sitio público).

### 8.4 Mejoras candidatas de esta etapa

El Bloque B las audita y prioriza conmigo. Tabla actualizada (2026-11-12):

| # | Mejora | Toca esquema | Bloque |
|---|---|---|---|
| M1 | Visor de planchas con zoom, paneo y botón de descarga | No | C |
| M2 | Rendimiento de medios: imágenes optimizadas, carga diferida de videos, tamaños correctos | No | C |
| M3 | Reordenar posts arrastrando en el panel, usando `posts.position` | **No** (la columna ya existe) | D |
| M4 | Estado borrador/publicado | **Ya hecho** (`posts.published`, checkbox en el panel) | — |
| M5 | Barra de progreso en las subidas. **Ya existe** (`PostForm.tsx`, `onUploadProgress`); falta pulirla: progreso total, cancelar, reintento (D1 de `docs/PLAN.md`) | No | D |
| M6 | Compresión automática de fotos al subirlas, más recortar y rotar en el panel (solo subidas nuevas; no reprocesar las existentes) | No | D |
| M7 | Búsqueda y filtros por sección o tipo en el sitio público | No | C |
| M8 | SEO y vista previa al compartir (título, descripción e imagen al pegar el link en WhatsApp) | No | C |
| M9 | ~~Modo oscuro y accesibilidad~~ **Quitada:** el sitio ya es oscuro. La accesibilidad entra en el pulido de §9. | — | — |
| M10 | Portada de tarjeta: la primera plancha de cada categoría; si no hay, el patrón actual | No | C |

Si en la auditoría encuentras algo más urgente (un bug, un hueco de seguridad), va antes que estas mejoras.

---

## 9. Diseño visual

- Estética **profesional, ordenada y coherente con Dibujo Técnico / Diseño Aplicado**. Se puede usar algo de lenguaje técnico (grillas sutiles, líneas de cota, tipografía mono para etiquetas y números de plano) sin recargar.
- Paleta con buen contraste y legibilidad. Si se agrega modo oscuro, ambos temas deben verse bien.
- Animaciones **ligeras** (Framer Motion u otra si hay razón), sin exagerar, y respetando `prefers-reduced-motion`.
- Las planchas como tarjetas con buena jerarquía visual (miniatura, título, ítem, sección).
- **No rediseñes todo de golpe.** Mejora sobre lo que ya hay. Si propones un cambio visual grande, muéstramelo primero en el plan.
- **Decisión (2026-11-12): el diseño blueprint actual se mantiene, sin rediseño.** El sitio ya es oscuro (no hay modo claro/oscuro). Solo se pule, en el Bloque C:
  - Subir tamaño y contraste de los textos pequeños (etiquetas mono, subtítulos, contadores) hasta pasar contraste **AA**.
  - Hacer que la animación del tornillo respete `prefers-reduced-motion`.
  - Revisar el hero y las tarjetas en celular.
  - Confirmar que el contador "2 secciones · 11 planos" sale de los datos (`src/lib/site.ts`) y no está escrito a mano.

---

## 10. Arquitectura y stack

- Mantén el stack actual salvo que haya una razón clara. **Tienes libertad** para usar otra librería o herramienta si es más adecuada, moderna o útil; explícame por qué en `docs/DECISIONES.md`. Cambiar el framework completo: solo con mi aprobación.
- Antes de usar la API de una librería (Auth.js, Drizzle, Vercel Blob, Next.js), revisa la versión instalada en `package.json` y su documentación actual. No asumas APIs de memoria.
- Variables de entorno: todas documentadas en `.env.example` sin valores reales. Separa claramente las de desarrollo y las de producción.
- Límites a tener en cuenta: las funciones serverless de Vercel tienen un límite bajo de tamaño de petición (del orden de 4.5 MB), así que los videos grandes **no** pueden pasar por el servidor; para eso es M5. Verifica los límites actuales de Vercel, Vercel Blob y Neon en su documentación y anótalos en HALLAZGOS.

---

## 11. Modelo de datos

Esquema real (`src/db/schema.ts`, verificado 2026-11-12):

- **`users`:** id (uuid), `username` (único), `password_hash`, `name`, `created_at`.
- **`posts`:** id (uuid), `title`, `slug` (único), `summary`, `body`, `section`, `subsection`, `plano_slug`, **`published`** (bool, default true), **`position`** (int, default 0), `created_at`, `updated_at`.
- **`post_media`:** id, `post_id` (FK cascade), `type` (`video_upload`/`youtube`/`image`/`link`), `url`, `label`, `file_name`, `file_size`, `position`, `created_at`.

`position` y `published` **ya existen y ya se usan** en el sitio y el panel. M3 (arrastrar) es solo interfaz y M4 ya está implementado como checkbox; solo habría migración si se quisiera un `status` de más estados (aditivo, §3).

---

## 12. Estructura de carpetas

```
docs/
  HALLAZGOS.md
  DECISIONES.md
  PLAN.md                   (sale del Bloque B, una página)
drizzle/                    migraciones (0000 + meta/)
scripts/
  seed.ts                   crea/actualiza el admin
  conteo-datos.ts           solo lectura, §14
  verificar-migraciones.ts  solo lectura, estado de migraciones
  baseline-migraciones.ts   registra 0000 como aplicada (aditivo, idempotente)
src/
  app/                      (public)/, admin/, api/, login/, layout, page
  components/{admin,public}/
  db/                       index.ts (cliente), schema.ts
  lib/                      db-guard, load-env, password, posts, site, slug, youtube
  auth.ts, auth.config.ts, proxy.ts
```

---

## 13. Bloques de trabajo (plan comprimido, acordado 2026-11-12)

Sustituye al plan original de fases 0–7. Modelo y esfuerzo recomendados por bloque; al terminar cada uno me dices cuál sigue. 🔎 = revisor independiente (**solo en el Bloque E**).

### Bloque A — Reconocimiento y blindaje · Sonnet 5.5 · `medium` · ✅ 2026-11-12
- Rama `mejoras`, guarda de BD (`src/lib/db-guard.ts`), scripts de conteo y verificación, docs, conteo base y límites anotados en HALLAZGOS.
- Baseline de migraciones aplicado en la rama de Neon `dev-mejoras` (producción queda para el Bloque E).

### Bloque B — Auditoría · Opus 5.5 · `high` · ✅ 2026-11-12 (`docs/PLAN.md`)
- Revisar todo el código (bugs, seguridad, rendimiento, accesibilidad, deuda) y escribir **una sola página** en `docs/PLAN.md` con hallazgos priorizados. **Sin código.**
- **Terminado cuando:** apruebo `PLAN.md`.

### Bloque C — Todo lo que no toca la base · Sonnet 5.5 · `high` · sin plan mode, **un commit por mejora** · C1–C9 implementados 2026-11-12 (falta el visto bueno de las pruebas 🌐)
- Correcciones de la auditoría (Bloque B).
- Visor de planchas con zoom, paneo y botón de descarga (M1).
- Rendimiento de medios: imágenes optimizadas, carga diferida de videos, tamaños correctos (M2).
- Búsqueda y filtros por sección o tipo (M7).
- SEO y vista previa al compartir (M8).
- **Portada de tarjeta:** la primera plancha (imagen) de cada categoría se usa como portada de su tarjeta; si no hay, se queda el patrón actual.
- Pulido de diseño de §9 (sin rediseño).
- **Terminado cuando:** build, typecheck y lint pasan, el conteo no cambió y me das el visto bueno en las pruebas 🌐.

### Bloque D — Panel y subidas · Opus 5.5 · `high` · sin migración
- Arrastrar para ordenar usando `posts.position` (M3). **Sin migración.**
- Pulir la barra de progreso de las subidas, que ya existe (M5). La ruta que autoriza la subida sigue verificando sesión de admin en servidor y limitando tipos y tamaños.
- Compresión automática de fotos (M6) y, en el panel, **recortar y rotar** fotos antes de subirlas. **Solo subidas nuevas; las fotos existentes no se tocan.**
- Se prueba solo con la rama de Neon y el Blob de desarrollo.
- **Terminado cuando:** reordeno en el panel y se refleja en el sitio; subo un video grande con progreso y una foto nueva recortada/comprimida; el conteo base sigue igual.

### Bloque E — Paso a producción · Opus 5.5 · `high` · 🔎
- Revisor independiente sobre el diff `main...mejoras` (único punto del plan con revisor); cada arreglo con su commit.
- Preview deployment en Vercel con la rama de Neon; lista de pruebas 🌐.
- Con mi aprobación explícita: rama de respaldo de Neon en producción → baseline de migraciones en producción (`scripts/baseline-migraciones.ts`, revisando el SQL conmigo) → `db:migrate` si hay migraciones nuevas → conteo en producción (debe dar 4 posts, 4 imágenes) → merge a `main`.
- **Terminado cuando:** producción tiene las mejoras, el conteo coincide y yo confirmé las pruebas manuales.

**Fable 5.2:** de reserva. Solo si Opus se atasca con un bug muy difícil o si se decide rehacer la arquitectura.

---

## 14. Plan de pruebas y verificación de datos

- **Script de conteo (`scripts/conteo-datos.ts`), solo lectura:**
  - Total de posts.
  - Posts por sección × subcategoría × ítem de Planos.
  - Total de URLs de archivos referenciadas (fotos, videos) y cuántas responden bien (HEAD, sin descargar).
  - Imprime el host de la base al inicio.
- Se corre al final del Bloque A (base), al final de cada bloque que toque datos o esquema, y en el preview y en producción en el Bloque E.
- **Siempre:** build, typecheck y lint en verde antes de cada commit.
- **Pruebas manuales (🌐):** las de cada "Terminado cuando" de §13, más:
  - `/` redirige a `/home`.
  - `/login` funciona y no está enlazado en ningún lado.
  - `/admin` sin sesión redirige a `/login`.
  - Todas las rutas de subcategoría de cada sección navegan bien en móvil y escritorio.
  - Las acciones de escritura fallan sin sesión (probado con una petición directa, no solo con la interfaz).

---

## 15. Riesgos conocidos

- **Borrar blobs de producción desde desarrollo** (§3.6). Es el riesgo más serio.
- **Migración que oculta o desordena planchas** por un default mal elegido (§3.4).
- **Conectar sin querer a producción** por un `.env` equivocado (§3.1).
- **Videos grandes:** límites de tamaño de Vercel y de Blob; puede convenir priorizar YouTube para videos largos.
- **Push a `main`** que despliegue cambios no revisados.
- **Restos de la versión estática** (`src/data`, config de GitHub Pages) que confundan o dupliquen contenido.

---

## 16. Preguntas abiertas para la Fase 0

1. ✅ Stack: ver §6 (Next 16.3.1, next-auth 5.0.0-beta.32, Drizzle 0.45.2, `@vercel/blob` 2.8.0).
2. ✅ Blob (client upload). El código **no** borra archivos al eliminar un post.
3. ✅ Ya existen `position` y `published` en `posts` (§11).
4. ✅ Proxy + layout + cada acción + `/api/upload`.
5. ✅ `src/data` no existe.
6. ✅ Production Branch de Vercel: `main` (única rama en GitHub).
7. ✅ Solo imágenes y videos; no hay PDFs.
8. ✅ Conteo base (rama `dev-mejoras`): 4 posts, 4 imágenes, 4/4 responden. Ver `docs/HALLAZGOS.md`.

---

## 17. Referencias

- Next.js: https://nextjs.org/docs
- Auth.js: https://authjs.dev
- Drizzle (migraciones): https://orm.drizzle.team/docs/migrations
- Neon (ramas): https://neon.com/docs/introduction/branching
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Claude Code (modelos y esfuerzo): https://code.claude.com/docs/en/model-config

---

## 18. Primer paso

Los Bloques A y B están terminados y el Bloque C está implementado (C1–C9, 2026-11-12), pendiente del visto bueno de las pruebas 🌐 en el preview. Siguiente: **Bloque D**, en el orden de `docs/PLAN.md` (D0 es un requisito tuyo: confirmar que `.env.local` usa el Blob de desarrollo). P0-4 resuelto el 2026-11-12: el preview de `mejoras` usa `dev-mejoras` y `cuaderno-dev` (ver §3.7).

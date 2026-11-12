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
13. Fases (con modelo, esfuerzo y criterio de "terminado")
14. Plan de pruebas y verificación de datos
15. Riesgos conocidos
16. Preguntas abiertas para la Fase 0
17. Referencias
18. Primer paso

---

## 0. Quién soy y cómo quiero que trabajes

- Me llamo Leonardo. Soy estudiante de Tecnología en Desarrollo de Software, nivel **principiante-intermedio**. Sé lo básico de JS/TS/TSX, Python, C# y C++.
- Explícame las decisiones importantes **en pocas líneas**, sin teoría larga. Si usas un concepto nuevo (por ejemplo "rama de Neon" o "client upload"), explícalo en una frase la primera vez.
- Trabaja **por fases** (sección 13). Al empezar cada fase, entra en **plan mode**, muéstrame el plan y **espera mi aprobación** antes de escribir código.
- Prefiero **cambios pequeños e iterativos**. No regeneres archivos completos si basta con una edición puntual.
- **Rapidez con calidad:** quiero avanzar rápido hacia versiones funcionales, pero sin bugs obvios, con código limpio y un resultado que se vea profesional. Nada de perfeccionismo en detalles menores.
- **No adivines en silencio.** Si algo es ambiguo, dime qué asumiste. Si una decisión es difícil de revertir y puede ir en cualquier dirección, para y pregúntame.
- **Commits:** uno por cambio lógico, con mensaje claro en español, solo cuando build, typecheck y lint pasen. Haz push de la rama de trabajo. **Nunca** hagas push ni merge a `main` sin mi aprobación explícita (ver §3).
- **Ventanas y procesos:** pídeme permiso antes de abrir el navegador o cualquier cosa que me abra ventanas. Cuando necesites que yo pruebe algo a mano, márcalo con **🌐 Probar en el navegador** y dame los pasos exactos (URL, qué hacer, qué debería ver).
- **Documentación viva:**
  - `docs/HALLAZGOS.md`: lo que descubras del código, la base de datos y los servicios (con fecha).
  - `docs/DECISIONES.md`: decisiones de arquitectura numeradas (D-001, D-002…), con el porqué y las alternativas descartadas.
  - Cuando termine una fase, márcala ✅ en §13 con la fecha.
- **Al final de cada fase** dime qué modelo y esfuerzo recomiendas para la siguiente (ver §13). Tú no puedes cambiarlos; los cambio yo con `/model` y `/effort`.
- **Revisor independiente:** en las fases marcadas con 🔎 en §13, al terminar lanza un subagente revisor que no haya visto el trabajo, para que revise el diff con ojos frescos. Corrige lo que encuentre, cada arreglo con su commit.

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
5. **Producción solo se migra al final** (Fase 7), con `drizzle-kit migrate` (o el script de migración que ya use el proyecto), después de crear una rama de respaldo en Neon, revisar conmigo el SQL de cada migración (`drizzle-kit generate` produce el .sql) y tener mi aprobación explícita. Nunca `push` en producción.
6. **Archivos de Vercel Blob:** nunca borres, muevas ni sobrescribas blobs existentes.
   - Ojo: la rama de Neon de desarrollo es una copia de la base, **pero el Blob no**. Si en desarrollo se elimina un post y el código llama a `del()` sobre su archivo, **se borra el archivo real que usa producción**. Por eso en desarrollo hay que usar **un Blob store separado** (otro token) o hacer que el borrado de archivos sea un no-op fuera de producción. Resuélvelo en la Fase 0, antes de probar cualquier eliminación.
7. **Git:** trabaja en la rama `mejoras` (o en ramas por fase que salgan de ella). `main` probablemente despliega a producción en Vercel ❓: nada de push ni merge a `main` sin mi aprobación.
8. **Secretos:** nunca imprimas, copies a documentos ni subas a git contraseñas, tokens o cadenas de conexión. Los `.env*` con valores reales no se commitean (solo `.env.example` sin valores). No cambies la contraseña del admin ni el `AUTH_SECRET` actuales.
9. **No cambies el contenido** (títulos, descripciones, orden, archivos de las planchas) salvo que yo lo pida. Las mejoras son de código, diseño y funciones.
10. **Conteo antes y después:** antes de empezar y al terminar cada fase que toque datos o esquema, corre el script de conteo de solo lectura (§14) y compara. Si algo baja, para todo y avísame.

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

La Fase 1 las audita y prioriza conmigo. Mi orden propuesto:

| # | Mejora | Toca esquema | Fase |
|---|---|---|---|
| M1 | Visor de planchas con zoom y paneo (clave para ver detalles de un plano) + botón de descarga | No | 3 |
| M2 | Rendimiento de medios: imágenes optimizadas, carga diferida de videos, tamaños correctos | No | 3 |
| M3 | Reordenar posts arrastrando en el panel | Sí (`order`, aditivo) | 4 |
| M4 | Estado borrador/publicado | Sí (`status`, default publicado) | 4 |
| M5 | Subida directa a Blob desde el navegador, con barra de progreso, para videos grandes | No ❓ | 5 |
| M6 | Compresión automática de fotos al subirlas (solo subidas nuevas; no reprocesar las existentes) | No | 5 |
| M7 | Búsqueda y filtros por sección o tipo en el sitio público | No | 6 |
| M8 | SEO y vista previa al compartir (título, descripción e imagen al pegar el link en WhatsApp) | No | 6 |
| M9 | Modo oscuro y mejoras de accesibilidad | No | 6 |

Si en la auditoría encuentras algo más urgente (un bug, un hueco de seguridad), va antes que estas mejoras.

---

## 9. Diseño visual

- Estética **profesional, ordenada y coherente con Dibujo Técnico / Diseño Aplicado**. Se puede usar algo de lenguaje técnico (grillas sutiles, líneas de cota, tipografía mono para etiquetas y números de plano) sin recargar.
- Paleta con buen contraste y legibilidad. Si se agrega modo oscuro, ambos temas deben verse bien.
- Animaciones **ligeras** (Framer Motion u otra si hay razón), sin exagerar, y respetando `prefers-reduced-motion`.
- Las planchas como tarjetas con buena jerarquía visual (miniatura, título, ítem, sección).
- **No rediseñes todo de golpe.** Mejora sobre lo que ya hay. Si propones un cambio visual grande, muéstramelo primero en el plan.

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
  PLAN.md                   (sale de la Fase 1)
drizzle/                    migraciones (0000 + meta/)
scripts/
  seed.ts                   crea/actualiza el admin
  conteo-datos.ts           solo lectura, §14
  verificar-migraciones.ts  solo lectura, estado de migraciones
src/
  app/                      (public)/, admin/, api/, login/, layout, page
  components/{admin,public}/
  db/                       index.ts (cliente), schema.ts
  lib/                      db-guard, load-env, password, posts, site, slug, youtube
  auth.ts, auth.config.ts, proxy.ts
```

---

## 13. Fases (con modelo, esfuerzo y criterio de "terminado")

Cada fase empieza en **plan mode** y espera mi aprobación. 🔎 = revisor independiente al terminar.

### Fase 0 — Reconocimiento y blindaje · Sonnet 5.5 · `medium`
- Leer el repo completo; corregir §6, §11 y §12 de este archivo con la realidad.
- `git remote -v` y crear la rama `mejoras`.
- Darme los pasos para crear la rama de Neon desde producción, crear un Blob store de desarrollo (o decidir el no-op de borrado, §3.6) y llenar `.env.local`.
- Agregar la guarda que imprime el host de la base y aborta si es producción (§3.1).
- Escribir `scripts/conteo-datos.ts` (§14), correrlo contra la rama de Neon y guardar el resultado base en HALLAZGOS.
- Crear `docs/HALLAZGOS.md` y `docs/DECISIONES.md`.
- Responder las preguntas de §16.
- **Terminado cuando:** la rama existe, `.env.local` apunta a la rama de Neon (confirmado por la guarda), el borrado de blobs en desarrollo no puede tocar producción, el conteo base está guardado y §16 está respondida.

### Fase 1 — Auditoría y plan · Opus 5.5 · `high`
- Revisar todo el código: bugs, seguridad (sesión verificada en servidor, rutas de subida protegidas, secretos), rendimiento, accesibilidad, código muerto (por ejemplo `src/data`) y deuda técnica.
- Escribir `docs/PLAN.md` con hallazgos priorizados, las mejoras M1–M9 ordenadas y, para cada tarea, qué modelo y esfuerzo recomiendas.
- **No escribe código.**
- **Terminado cuando:** apruebo `PLAN.md`.

### Fase 2 — Correcciones · Sonnet 5.5 · `medium` · 🔎
- Bugs y deuda de la Fase 1, cada uno con su commit.
- **Terminado cuando:** build, typecheck y lint pasan, el conteo no cambió y el revisor no deja pendientes importantes.

### Fase 3 — Visor de planchas y medios (M1, M2) · Sonnet 5.5 · `high`
- **Terminado cuando:** puedo hacer zoom y paneo en una plancha real en móvil y en escritorio, descargarla, y las páginas cargan más rápido que antes (dime cómo lo mediste).

### Fase 4 — Orden y borradores (M3, M4) · Opus 5.5 · `high` para la migración; Sonnet 5.5 · `high` para la interfaz · 🔎
- Migración aditiva probada **solo** en la rama de Neon. Muéstrame el SQL generado antes de aplicarla.
- **Terminado cuando:** reordeno en el panel y se refleja en el sitio, un borrador no aparece en público, y **todas las planchas existentes siguen visibles y en el mismo orden** (conteo igual).

### Fase 5 — Subidas (M5, M6) · Opus 5.5 · `high` · 🔎
- La ruta que autoriza la subida directa a Blob verifica la sesión de admin en el servidor y limita tipos y tamaños de archivo.
- **Terminado cuando:** subo un video grande con barra de progreso desde el panel en desarrollo (al Blob de desarrollo), y una foto nueva se comprime sin perder calidad visible.

### Fase 6 — Extras (M7, M8, M9) · Sonnet 5.5 · `medium`
- **Terminado cuando:** la búsqueda y los filtros funcionan, el link compartido en WhatsApp muestra título e imagen (en el preview de Vercel), y el modo oscuro se ve bien en todas las páginas públicas.

### Fase 7 — Revisión final y paso a producción · Opus 5.5 · `high` · 🔎
- Revisión completa del diff `main...mejoras` con el revisor.
- Preview deployment en Vercel conectado a la rama de Neon; dame la lista de 🌐 pruebas manuales.
- Con mi aprobación: rama de respaldo de Neon en producción → migración de Drizzle en producción → conteo en producción → merge a `main`.
- **Terminado cuando:** producción tiene las mejoras, el conteo de producción coincide con el de antes y yo confirmé las pruebas manuales.

**Fable 5.2:** de reserva. Solo si Opus se atasca con un bug muy difícil o si decidimos rehacer la arquitectura. Si crees que alguna tarea lo necesita, dímelo y explica por qué.

---

## 14. Plan de pruebas y verificación de datos

- **Script de conteo (`scripts/conteo-datos.ts`), solo lectura:**
  - Total de posts.
  - Posts por sección × subcategoría × ítem de Planos.
  - Total de URLs de archivos referenciadas (fotos, videos) y cuántas responden bien (HEAD, sin descargar).
  - Imprime el host de la base al inicio.
- Se corre al final de la Fase 0 (base), al final de cada fase que toque datos o esquema, y en el preview y en producción en la Fase 7.
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
6. ❓ Pendiente: confirmar en Vercel la Production Branch (¿`main`?).
7. ✅ Solo imágenes y videos; no hay PDFs.
8. ❓ Pendiente: conteo base (requiere `.env.local` con la rama de Neon). Ver `docs/HALLAZGOS.md`.

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

Empieza la **Fase 0** en plan mode. No cambies funcionalidad ni toques ninguna base de datos hasta que la guarda de §3.1 esté puesta y yo haya configurado `.env.local` con la rama de Neon.

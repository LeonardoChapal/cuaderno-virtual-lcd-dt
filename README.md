# Cuaderno Virtual — Dibujo Técnico / Diseño Aplicado

Cuaderno virtual de **Leonardo Chapal Díaz** — I.E.M Técnico Industrial, grado 9-2.
Reúne los planos, las consultas y los videos de apoyo de las dos secciones de la
asignatura, con un panel privado para publicar el material.

---

## Stack

| Capa            | Herramienta                                    |
| --------------- | ---------------------------------------------- |
| Framework       | Next.js 16 (App Router, React 19, TypeScript)   |
| Estilos         | Tailwind CSS v4 (tokens en `@theme`)            |
| Animación       | `motion` + animaciones CSS/SVG nativas          |
| Base de datos   | Neon Postgres                                   |
| ORM             | Drizzle ORM (`drizzle-kit` para migraciones)    |
| Autenticación   | Auth.js v5 (NextAuth) — proveedor de credenciales |
| Archivos        | Vercel Blob (subida directa desde el navegador) |
| Despliegue      | Vercel                                          |

---

## Rutas

### Públicas

| Ruta                                | Contenido                                     |
| ----------------------------------- | --------------------------------------------- |
| `/`                                 | Redirige a `/home`                            |
| `/home`                             | Índice con las dos secciones                  |
| `/diseno-aplicado`                  | Sección 1                                     |
| `/diseno-aplicado/videos`           | Videos de apoyo                               |
| `/diseno-aplicado/consultas`        | Consultas                                     |
| `/diseno-aplicado/planos`           | Planos (5 láminas)                            |
| `/diseno-aplicado/planos/[plano]`   | `planos`, `tornillo`, `proyecto-1`, `proyecto-2`, `tornillo-en-perspectiva` |
| `/fundamentacion-tecnologica`       | Sección 2                                     |
| `/fundamentacion-tecnologica/planos`| Planos (6 láminas)                            |
| `/fundamentacion-tecnologica/planos/[plano]` | `planos`, `tornillo`, `proyecto`, `carpeta`, `proyecto-2`, `caldereria` |
| `/fundamentacion-tecnologica/videos` · `/consultas` | Videos de apoyo y Consultas    |

Las dos páginas de **Planos** son rutas independientes pero renderizan el mismo
componente compartido: [`src/components/public/PlanosIndex.tsx`](src/components/public/PlanosIndex.tsx).
Cambia sólo la lista de datos, que vive en [`src/lib/site.ts`](src/lib/site.ts).

### Privadas

| Ruta                 | Contenido                                        |
| -------------------- | ------------------------------------------------ |
| `/login`             | Acceso del administrador (oculto, `noindex`)     |
| `/admin`             | Lista de publicaciones                           |
| `/admin/posts/nuevo` | Crear publicación                                |
| `/admin/posts/[id]`  | Editar publicación                               |

`/login` no está enlazada desde ninguna navegación pública. `/admin/**` está
protegida por [`src/proxy.ts`](src/proxy.ts) y, además, por una comprobación de
sesión en [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx).

---

## Puesta en marcha local

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run db:push              # crea las tablas en Neon
npm run db:seed              # crea el usuario administrador
npm run dev
```

El sitio público funciona aunque todavía no exista base de datos: las listas
quedan vacías en vez de romper el build.

### Scripts

| Script              | Qué hace                                        |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                          |
| `npm run build`     | Build de producción                             |
| `npm run typecheck` | Comprueba tipos sin compilar                    |
| `npm run lint`      | ESLint                                          |
| `npm run db:push`   | Aplica el esquema a Neon                        |
| `npm run db:seed`   | Crea o actualiza el administrador               |
| `npm run db:studio` | Explorador visual de la base de datos           |

---

## Variables de entorno

Todas están documentadas en [`.env.example`](.env.example).

| Variable                | Para qué sirve                                       |
| ----------------------- | ---------------------------------------------------- |
| `DATABASE_URL`          | Cadena de conexión *pooled* de Neon                  |
| `AUTH_SECRET`           | Firma de la sesión (`npx auth secret` la genera)     |
| `ADMIN_USERNAME`        | Usuario del administrador (por defecto `admin`)      |
| `ADMIN_PASSWORD`        | Contraseña en claro; sólo se usa para sembrar el hash|
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob                                 |
| `MAX_UPLOAD_MB`         | Opcional. Tope por archivo, 300 MB por defecto       |

---

## Despliegue en Vercel — pasos manuales

1. **Crear la base de datos en Neon**
   - Entra en [neon.tech](https://neon.tech) y crea un proyecto Postgres.
   - Copia la *connection string* **pooled** (la que incluye `-pooler`).

2. **Crear el proyecto en Vercel**
   - En [vercel.com/new](https://vercel.com/new) importa el repositorio de GitHub.
   - Framework: Next.js (se detecta solo). No hace falta tocar el build.

3. **Conectar el almacenamiento de archivos**
   - En el proyecto de Vercel: **Storage → Create → Blob**.
   - Al conectarlo, Vercel inyecta `BLOB_READ_WRITE_TOKEN` automáticamente.

4. **Configurar las variables de entorno**
   - En **Settings → Environment Variables** añade `DATABASE_URL`,
     `AUTH_SECRET`, `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
   - Genera el secreto con `npx auth secret`.

5. **Crear las tablas y el administrador**
   - En local, con el `.env.local` apuntando a Neon:
     ```bash
     npm run db:push
     npm run db:seed
     ```

6. **Desplegar** — cada `git push` a `main` publica una nueva versión.

> Para cambiar la contraseña después: actualiza `ADMIN_PASSWORD` (en `.env.local`
> y en Vercel) y vuelve a ejecutar `npm run db:seed`.

---

## Límites de subida

Los archivos van directo del navegador a Vercel Blob mediante tokens firmados
([`src/app/api/upload/route.ts`](src/app/api/upload/route.ts)), así que **no**
aplica el límite de 4,5 MB del cuerpo de una función serverless. Vercel Blob
admite hasta 5 TB por archivo con subida multiparte, que ya está activada.

El tope propio del proyecto es de **300 MB por archivo**, ajustable con
`MAX_UPLOAD_MB`. Ten en cuenta que el plan gratuito de Vercel incluye una cuota
de almacenamiento y de transferencia limitada: para videos largos conviene
usar el enlace de YouTube en vez de subir el archivo.

---

## Estructura

```
src/
├─ app/
│  ├─ (public)/          Sitio público (cabecera, rótulo, transiciones)
│  │  ├─ home/
│  │  └─ [section]/      Sección, videos, consultas, planos, planos/[plano]
│  ├─ admin/             Panel protegido + acciones de servidor
│  ├─ login/             Acceso oculto
│  └─ api/
│     ├─ auth/[...nextauth]/
│     └─ upload/         Tokens de subida a Vercel Blob
├─ components/
│  ├─ public/            Componentes visuales del sitio
│  └─ admin/             Formulario de publicaciones
├─ db/                   Esquema y cliente de Drizzle
├─ lib/                  Navegación, consultas, utilidades
├─ auth.ts               Auth.js (Node: credenciales + bcrypt)
├─ auth.config.ts        Auth.js (edge-safe: guardia de rutas)
└─ proxy.ts              Protección de /admin
```

---

## Diseño

Dirección visual **cianotipia**: el sitio se comporta como una lámina de dibujo
técnico. Fondo azul de Prusia, retícula milimetrada a dos escalas, marcas de
encuadre y centrado en los bordes, y el **rótulo** (title block) como pie de
página. Regla del sistema: no hay sombras — en proyección ortogonal no existen;
la profundidad se construye con grosor de línea y valor.

- **Paleta**: `ferro #06121F`, `prussian #0C2038`, `blueline #2E6E9E`,
  `cyan #5FD3F3`, `chalk #E8F1F8`, `graphite #8AA6BC`, `amber #FFA724`.
- **Tipografía**: Archivo Narrow (lettering de lámina, linaje DIN),
  IBM Plex Sans (texto), IBM Plex Mono (códigos, cotas y metadatos).
- **Animación**: en `/home` un tornillo M12 se dibuja solo en el orden real de
  trazado — eje, contornos, detalle, acotación. El resto son microinteracciones
  discretas. Todo respeta `prefers-reduced-motion`.

---

© Leonardo Chapal Díaz — I.E.M Técnico Industrial, Pasto, Colombia.

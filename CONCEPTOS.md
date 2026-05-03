# 🧠 Conceptos Fundamentales de Next.js

Esta guía explica los conceptos clave que aprenderás en este proyecto.

## 📑 Índice

1. [Sistema de Rutas (App Router)](#sistema-de-rutas-app-router)
2. [Server Components vs Client Components](#server-components-vs-client-components)
3. [Estrategias de Renderizado](#estrategias-de-renderizado)
4. [Data Fetching](#data-fetching)
5. [React Hooks](#react-hooks)
6. [SCSS y CSS Modules](#scss-y-css-modules)

---

## Sistema de Rutas (App Router)

### ¿Qué es el App Router?

El App Router es el nuevo sistema de rutas de Next.js 14, basado en el sistema de archivos dentro de la carpeta `app/`.

### Estructura de Rutas

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/:slug (dinámico)
```

### Tipos de Rutas

#### 1. Rutas Estáticas
```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>Sobre mí</div>;
}
```

#### 2. Rutas Dinámicas
```typescript
// app/blog/[slug]/page.tsx
export default function PostPage({ params }: { params: { slug: string } }) {
  return <div>Post: {params.slug}</div>;
}
```

### Layouts

Los layouts son componentes que envuelven páginas y se comparten entre rutas.

```typescript
// app/layout.tsx (Root Layout)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

**Características:**
- Se mantienen entre navegaciones (no se re-renderizan)
- Pueden anidarse (nested layouts)
- Comparten UI común (header, footer, sidebar)

---

## Server Components vs Client Components

### Server Components (Por Defecto)

**¿Qué son?**
Componentes que se ejecutan **solo en el servidor**.

**Características:**
- ✅ No envían JavaScript al cliente
- ✅ Pueden acceder a bases de datos directamente
- ✅ Mejor rendimiento y SEO
- ❌ No pueden usar hooks (useState, useEffect)
- ❌ No pueden manejar eventos (onClick, onChange)

**Ejemplo:**
```typescript
// Server Component (por defecto)
export default function PostList() {
  const posts = await fetchPosts(); // Puede hacer fetch directo
  
  return (
    <div>
      {posts.map(post => <PostCard key={post.id} {...post} />)}
    </div>
  );
}
```

### Client Components

**¿Qué son?**
Componentes que se ejecutan **en el navegador**.

**Características:**
- ✅ Pueden usar hooks (useState, useEffect, etc.)
- ✅ Pueden manejar eventos del usuario
- ✅ Permiten interactividad
- ❌ Envían JavaScript al cliente
- ❌ No pueden acceder directamente a bases de datos

**Ejemplo:**
```typescript
'use client'; // Directiva necesaria

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  );
}
```

### ¿Cuándo usar cada uno?

| Usar Server Component | Usar Client Component |
|----------------------|----------------------|
| Fetch de datos | Interactividad (clicks, inputs) |
| Acceso a backend | useState, useEffect |
| Contenido estático | Formularios |
| SEO importante | Event listeners |
| Reducir bundle size | Browser APIs (localStorage) |

---

## Estrategias de Renderizado

### 1. SSG (Static Site Generation)

**¿Qué es?**
Genera HTML en **build time** (cuando ejecutas `npm run build`).

**Cuándo usar:**
- Contenido que no cambia frecuentemente
- Blogs, documentación, landing pages
- Mejor rendimiento posible

**Ejemplo:**
```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  return <article>{post.content}</article>;
}
```

**Ventajas:**
- ⚡ Ultra rápido (HTML pre-generado)
- 💰 Económico (se puede servir desde CDN)
- 🔍 Excelente SEO

**Desventajas:**
- 🔄 Requiere rebuild para actualizar contenido
- 📦 Build time aumenta con muchas páginas

### 2. SSR (Server-Side Rendering)

**¿Qué es?**
Genera HTML en **cada request** (cada vez que alguien visita la página).

**Cuándo usar:**
- Contenido que cambia frecuentemente
- Datos personalizados por usuario
- Datos en tiempo real

**Ejemplo:**
```typescript
// Server Component por defecto hace SSR
export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // Fuerza SSR (no cachea)
  });
  
  return <div>{data}</div>;
}
```

**Ventajas:**
- 🔄 Siempre actualizado
- 👤 Puede personalizar por usuario
- 🔍 Buen SEO

**Desventajas:**
- 🐌 Más lento que SSG
- 💸 Más costoso (servidor siempre activo)

### 3. CSR (Client-Side Rendering)

**¿Qué es?**
Renderiza en el **navegador** usando JavaScript.

**Cuándo usar:**
- Dashboards privados (no necesitan SEO)
- Aplicaciones interactivas
- Datos que cambian constantemente

**Ejemplo:**
```typescript
'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data}</div>;
}
```

**Ventajas:**
- 🎨 Muy interactivo
- 🔄 Actualizaciones en tiempo real
- 📱 Funciona offline (con service workers)

**Desventajas:**
- 🐌 Carga inicial más lenta
- ❌ SEO limitado
- 📦 Más JavaScript al cliente

### Comparación Rápida

| Estrategia | Cuándo se genera | Velocidad | SEO | Uso |
|-----------|------------------|-----------|-----|-----|
| **SSG** | Build time | ⚡⚡⚡ | ✅✅✅ | Blogs, docs |
| **SSR** | Cada request | ⚡⚡ | ✅✅ | Dashboards, perfiles |
| **CSR** | En el navegador | ⚡ | ❌ | Apps interactivas |

---

## Data Fetching

### En Server Components

```typescript
// Fetch directo (SSR por defecto)
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  
  return <div>{json.title}</div>;
}
```

### Opciones de Caching

```typescript
// SSG (cachea para siempre)
fetch('url', { cache: 'force-cache' })

// SSR (no cachea)
fetch('url', { cache: 'no-store' })

// ISR (revalida cada X segundos)
fetch('url', { next: { revalidate: 60 } })
```

### En Client Components

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ClientData() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data?.title}</div>;
}
```

---

## React Hooks

### useState

**¿Para qué?** Manejar estado local en componentes.

```typescript
const [count, setCount] = useState(0);

// Actualizar estado
setCount(count + 1);

// O con función
setCount(prev => prev + 1);
```

**Cuándo usar:**
- Valores que cambian (inputs, toggles, contadores)
- Estado local del componente
- Interactividad

### useEffect

**¿Para qué?** Ejecutar código cuando algo cambia (efectos secundarios).

```typescript
useEffect(() => {
  // Se ejecuta después del render
  console.log('Componente montado o actualizado');
  
  // Cleanup (opcional)
  return () => {
    console.log('Componente desmontado');
  };
}, [dependencies]); // Array de dependencias
```

**Casos de uso:**
- Fetch de datos
- Suscripciones (WebSockets)
- Manipular el DOM
- localStorage

**Dependencias:**
```typescript
useEffect(() => {}, []);        // Solo al montar
useEffect(() => {}, [count]);   // Cuando count cambia
useEffect(() => {});            // En cada render (evitar)
```

### Custom Hooks

**¿Para qué?** Reutilizar lógica entre componentes.

```typescript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// Uso
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

---

## SCSS y CSS Modules

### ¿Qué son CSS Modules?

Archivos `.module.scss` que tienen **scope local** (no afectan otros componentes).

```scss
// Header.module.scss
.header {
  background: blue;
  
  .title {
    color: white;
  }
}
```

```typescript
// Header.tsx
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Mi Blog</h1>
    </header>
  );
}
```

### Variables SCSS

```scss
// _variables.scss
$primary-color: #2563eb;
$spacing-md: 1rem;

// Uso
.button {
  background: $primary-color;
  padding: $spacing-md;
}
```

### Mixins

```scss
// _mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// Uso
.container {
  @include flex-center;
}
```

### Responsive Design

```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'md' {
    @media (min-width: 768px) {
      @content;
    }
  }
}

// Uso
.card {
  width: 100%;
  
  @include respond-to('md') {
    width: 50%;
  }
}
```

---

## 🎯 Resumen de Conceptos Clave

| Concepto | Qué es | Cuándo usar |
|----------|--------|-------------|
| **Server Component** | Componente del servidor | Por defecto, fetch de datos |
| **Client Component** | Componente del navegador | Interactividad, hooks |
| **SSG** | HTML en build time | Blogs, contenido estático |
| **SSR** | HTML en cada request | Datos dinámicos, personalizados |
| **CSR** | Renderizado en navegador | Apps interactivas |
| **useState** | Estado local | Valores que cambian |
| **useEffect** | Efectos secundarios | Fetch, suscripciones, DOM |
| **CSS Modules** | Estilos con scope | Evitar conflictos de CSS |

---

## 📚 Recursos para Profundizar

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [SCSS Guide](https://sass-lang.com/guide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**¡Ahora estás listo para dominar Next.js! 🚀**

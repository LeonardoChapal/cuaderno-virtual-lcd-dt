# 📝 Guía de Ejercicios - Blog Personal Next.js

Esta guía detalla todos los ejercicios que debes completar para dominar los conceptos de Next.js.

## 📋 Índice de Ejercicios

1. [Filtrado y Paginación en Blog](#1-filtrado-y-paginación-en-blog)
2. [Página de Post Individual (SSG)](#2-página-de-post-individual-ssg)
3. [Página Sobre Mí (SSR)](#3-página-sobre-mí-ssr)
4. [Sección de Comentarios](#4-sección-de-comentarios)
5. [Toggle de Tema](#5-toggle-de-tema)
6. [Formulario de Contacto](#6-formulario-de-contacto)
7. [Custom Hook useLocalStorage](#7-custom-hook-uselocalstorage)
8. [Mejoras en Estilos](#8-mejoras-en-estilos)

---

## 1. Filtrado y Paginación en Blog

**Archivo**: `app/blog/page.tsx`  
**Nivel**: Intermedio  
**Conceptos**: Client Components, useState, filtrado de arrays

### Objetivo
Convertir la página de blog en un Client Component y agregar funcionalidad de filtrado por categoría y paginación.

### Pasos

1. **Agregar 'use client' al inicio del archivo**

2. **Implementar filtrado por categoría**
   ```typescript
   const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
   
   const filteredPosts = selectedCategory === 'Todos' 
     ? postsData 
     : postsData.filter(post => post.category === selectedCategory);
   ```

3. **Crear botones de filtro**
   ```tsx
   <div className={styles.filters}>
     <button onClick={() => setSelectedCategory('Todos')}>Todos</button>
     <button onClick={() => setSelectedCategory('Tutorial')}>Tutorial</button>
     {/* Más categorías... */}
   </div>
   ```

4. **Implementar paginación**
   ```typescript
   const [currentPage, setCurrentPage] = useState(1);
   const postsPerPage = 6;
   
   const indexOfLastPost = currentPage * postsPerPage;
   const indexOfFirstPost = indexOfLastPost - postsPerPage;
   const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
   ```

### Verificación
- ✅ Los filtros cambian los posts mostrados
- ✅ La paginación funciona correctamente
- ✅ Los filtros y paginación funcionan juntos

---

## 2. Página de Post Individual (SSG)

**Archivo**: `app/blog/[slug]/page.tsx`  
**Nivel**: Intermedio  
**Conceptos**: SSG, generateStaticParams, dynamic routes

### Objetivo
Implementar una página que muestre el contenido completo de un post usando Static Site Generation.

### Pasos

1. **Implementar generateStaticParams**
   ```typescript
   export async function generateStaticParams() {
     return postsData.map((post) => ({
       slug: post.slug,
     }));
   }
   ```

2. **Buscar el post por slug**
   ```typescript
   const post = postsData.find(p => p.slug === params.slug);
   
   if (!post) {
     notFound();
   }
   ```

3. **Crear el JSX del artículo**
   ```tsx
   <article>
     <h1>{post.title}</h1>
     <div className={styles.meta}>
       <time>{new Date(post.date).toLocaleDateString()}</time>
       <span>{post.category}</span>
       <span>{post.readTime}</span>
     </div>
     <div className={styles.content}>
       {post.content}
     </div>
   </article>
   ```

4. **Crear estilos en page.module.scss**

### Verificación
- ✅ Puedes navegar a `/blog/introduccion-nextjs-14`
- ✅ Se muestra el contenido del post
- ✅ Los slugs inexistentes muestran 404
- ✅ `npm run build` genera páginas estáticas

---

## 3. Página Sobre Mí (SSR)

**Archivo**: `app/about/page.tsx`  
**Nivel**: Básico  
**Conceptos**: SSR, Server Components, data fetching

### Objetivo
Crear una página que muestre información del autor usando Server-Side Rendering.

### Pasos

1. **Importar datos del autor**
   ```typescript
   import authorData from '@/data/author.json';
   ```

2. **Crear estructura de la página**
   ```tsx
   <div className={styles.aboutPage}>
     <div className={styles.hero}>
       <h1>{authorData.name}</h1>
       <p>{authorData.role}</p>
     </div>
     
     <div className={styles.bio}>
       <h2>Sobre mí</h2>
       <p>{authorData.bio}</p>
     </div>
     
     <div className={styles.skills}>
       <h2>Habilidades</h2>
       <ul>
         {authorData.skills.map(skill => (
           <li key={skill}>{skill}</li>
         ))}
       </ul>
     </div>
     
     <div className={styles.social}>
       <a href={authorData.social.github}>GitHub</a>
       {/* Más redes sociales... */}
     </div>
   </div>
   ```

3. **Crear estilos atractivos**

### Verificación
- ✅ Se muestra toda la información del autor
- ✅ Los links a redes sociales funcionan
- ✅ El diseño es responsive

---

## 4. Sección de Comentarios

**Archivo**: `src/components/CommentSection.tsx`  
**Nivel**: Intermedio  
**Conceptos**: useState, Client Components, formularios

### Objetivo
Crear un componente interactivo para agregar y mostrar comentarios.

### Pasos

1. **Crear estados**
   ```typescript
   const [comments, setComments] = useState<Comment[]>([]);
   const [author, setAuthor] = useState('');
   const [text, setText] = useState('');
   ```

2. **Implementar handleSubmit**
   ```typescript
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!author || !text) return;
     
     const newComment: Comment = {
       id: Date.now(),
       author,
       text,
       date: new Date().toISOString(),
     };
     
     setComments([...comments, newComment]);
     setAuthor('');
     setText('');
   };
   ```

3. **Crear el formulario y lista**

### Verificación
- ✅ Puedes agregar comentarios
- ✅ Los comentarios se muestran en la lista
- ✅ El formulario se limpia después de enviar

---

## 5. Toggle de Tema

**Archivo**: `src/components/ThemeToggle.tsx`  
**Nivel**: Avanzado  
**Conceptos**: useState, useEffect, localStorage, DOM manipulation

### Objetivo
Implementar un botón que cambie entre tema claro y oscuro, persistiendo la preferencia.

### Pasos

1. **Crear estado y cargar desde localStorage**
   ```typescript
   const [theme, setTheme] = useState<'light' | 'dark'>('light');
   
   useEffect(() => {
     const saved = localStorage.getItem('theme') as 'light' | 'dark';
     if (saved) setTheme(saved);
   }, []);
   ```

2. **Aplicar tema al body**
   ```typescript
   useEffect(() => {
     if (theme === 'dark') {
       document.body.classList.add('dark');
     } else {
       document.body.classList.remove('dark');
     }
   }, [theme]);
   ```

3. **Función toggle**
   ```typescript
   const toggleTheme = () => {
     const newTheme = theme === 'light' ? 'dark' : 'light';
     setTheme(newTheme);
     localStorage.setItem('theme', newTheme);
   };
   ```

4. **Agregar estilos CSS para tema oscuro en globals.scss**

### Verificación
- ✅ El botón cambia el tema
- ✅ El tema persiste al recargar
- ✅ Los estilos cambian correctamente

---

## 6. Formulario de Contacto

**Archivo**: `app/contact/page.tsx`  
**Nivel**: Intermedio  
**Conceptos**: useState, validación, formularios controlados

### Objetivo
Crear un formulario de contacto con validación completa.

### Pasos

1. **Agregar 'use client' y crear estados**

2. **Implementar validación**
   ```typescript
   const validate = () => {
     const errors: any = {};
     
     if (!name || name.length < 2) {
       errors.name = 'El nombre debe tener al menos 2 caracteres';
     }
     
     if (!email || !/\S+@\S+\.\S+/.test(email)) {
       errors.email = 'Email inválido';
     }
     
     if (!message || message.length < 10) {
       errors.message = 'El mensaje debe tener al menos 10 caracteres';
     }
     
     return errors;
   };
   ```

3. **Crear formulario con inputs controlados**

4. **Mostrar errores y mensaje de éxito**

### Verificación
- ✅ La validación funciona correctamente
- ✅ Se muestran mensajes de error
- ✅ Se muestra mensaje de éxito al enviar

---

## 7. Custom Hook useLocalStorage

**Archivo**: `src/hooks/useLocalStorage.tsx`  
**Nivel**: Avanzado  
**Conceptos**: Custom hooks, generics, localStorage

### Objetivo
Crear un hook reutilizable que funcione como useState pero persista en localStorage.

### Pasos

1. **Implementar el hook**
   ```typescript
   export function useLocalStorage<T>(key: string, initialValue: T) {
     const [storedValue, setStoredValue] = useState<T>(() => {
       try {
         const item = window.localStorage.getItem(key);
         return item ? JSON.parse(item) : initialValue;
       } catch (error) {
         return initialValue;
       }
     });
     
     const setValue = (value: T) => {
       try {
         setStoredValue(value);
         window.localStorage.setItem(key, JSON.stringify(value));
       } catch (error) {
         console.error(error);
       }
     };
     
     return [storedValue, setValue] as const;
   }
   ```

2. **Usar el hook en ThemeToggle o CommentSection**

### Verificación
- ✅ El hook funciona como useState
- ✅ Los valores persisten en localStorage
- ✅ Funciona con diferentes tipos de datos

---

## 8. Mejoras en Estilos

**Archivos**: Varios `.module.scss`  
**Nivel**: Básico-Intermedio  
**Conceptos**: SCSS, CSS Modules, responsive design

### Tareas

1. **Completar _typography.scss**
   - Agregar estilos para listas
   - Agregar estilos para blockquotes
   - Agregar estilos para code

2. **Mejorar BlogCard.module.scss**
   - Agregar animaciones
   - Mejorar hover effects
   - Agregar estilos para imagen

3. **Crear estilos para CommentSection**
   - Diseño atractivo del formulario
   - Estilos para los comentarios
   - Responsive design

### Verificación
- ✅ Los estilos son consistentes
- ✅ El diseño es responsive
- ✅ Las animaciones son suaves

---

## 🎯 Orden Sugerido de Ejercicios

Para un aprendizaje progresivo, sigue este orden:

1. **Básico**
   - Página Sobre Mí (SSR)
   - Mejoras en Estilos

2. **Intermedio**
   - Página de Post Individual (SSG)
   - Sección de Comentarios
   - Formulario de Contacto
   - Filtrado y Paginación

3. **Avanzado**
   - Toggle de Tema
   - Custom Hook useLocalStorage

---

## 💡 Consejos Generales

- **Lee los comentarios**: Cada archivo TODO tiene instrucciones detalladas
- **Prueba frecuentemente**: Guarda y verifica en el navegador
- **Usa la consola**: Para debugging y entender el flujo
- **Experimenta**: No tengas miedo de probar cosas nuevas
- **Compara con ejemplos**: Los archivos COMPLETOS son tu referencia

---

## 🆘 ¿Necesitas Ayuda?

Si te atascas:

1. Lee los comentarios en el archivo
2. Revisa los archivos COMPLETOS similares
3. Consulta la documentación de Next.js
4. Usa console.log() para debugging
5. Pregunta a tu instructor

---

**¡Éxito en tu aprendizaje! 🚀**

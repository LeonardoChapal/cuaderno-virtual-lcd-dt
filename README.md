# 📐 Cuaderno Virtual — Dibujo Técnico

> Espacio digital para organizar y compartir el material académico de la especialidad de **Dibujo Técnico**: apuntes, investigaciones, planchas, ejercicios y exámenes.

---

## 🔗 Ver sitio

🌐 [cuaderno-virtual-lcd-dt](https://leonardochapal.github.io/cuaderno-virtual-lcd-dt)

---

## ✨ Características

- 🎨 **Diseño moderno** con paleta turquesa profesional
- 📐 **Plano arquitectónico animado** en la portada (SVG con efecto de trazado)
- 🏷️ **Categorización por materia** con íconos personalizados
- 📊 **Sección de estadísticas** con contadores animados
- 📱 **Diseño responsive** adaptado a móvil, tablet y escritorio
- ⚡ **Animaciones sutiles** en tarjetas, botones y enlaces
- 🚀 **Despliegue automático** con GitHub Actions

---

## 📋 Contenido

| Sección | Descripción |
|---|---|
| 📝 **Apuntes** | Notas y resúmenes de clases |
| 🔬 **Investigaciones** | Aportes e investigaciones por tema |
| 📏 **Planchas y Planos** | Trabajos de representación técnica |
| ✏️ **Ejercicios** | Prácticas y actividades resueltas |
| 📄 **Exámenes** | Material de evaluaciones |

---

## 🚀 Tecnologías

| Tecnología | Versión | Descripción |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.6 | Framework de React con App Router |
| [React](https://react.dev/) | 19.2.3 | Librería de UI |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Estilos por utilidades |
| [SCSS / Sass](https://sass-lang.com/) | ^1.97.3 | Estilos con alcance por componente |
| [Framer Motion](https://www.framer.com/motion/) | latest | Librería de animaciones |

---

## 📁 Estructura del proyecto

```
├── public/                    # Archivos estáticos
├── src/
│   ├── app/                   # Rutas con App Router
│   │   ├── about/             # Página "Sobre Mí"
│   │   ├── blog/
│   │   │   └── [slug]/        # Apuntes individuales (rutas dinámicas)
│   │   ├── globals.scss       # Estilos globales
│   │   ├── layout.tsx         # Layout raíz
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes reutilizables
│   │   ├── BlogCard.tsx       # Tarjeta de apunte
│   │   ├── Footer.tsx         # Pie de página
│   │   ├── Header.tsx         # Navegación
│   │   ├── Stats.tsx          # Contadores animados
│   │   └── TechnicalDrawing.tsx  # Plano arquitectónico SVG animado
│   ├── data/                  # Contenido del cuaderno (JSON)
│   │   ├── author.json        # Información del autor
│   │   └── posts.json         # Apuntes y entradas
│   └── styles/                # Variables, mixins y tipografía SCSS
├── .github/
│   └── workflows/
│       └── deploy.yml         # Despliegue automático a GitHub Pages
└── next.config.ts             # Configuración para exportación estática
```

---

## 🛠️ Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/LeonardoChapal/cuaderno-virtual-lcd-dt.git
cd cuaderno-virtual-lcd-dt

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000/cuaderno-virtual-lcd-dt](http://localhost:3000/cuaderno-virtual-lcd-dt) en tu navegador.

---

## 📦 Despliegue

El sitio se despliega automáticamente en **GitHub Pages** con cada push a la rama `main` mediante GitHub Actions.

```bash
# Compilar para producción
npm run build
```

La carpeta `out/` contiene el sitio estático listo para publicar.

---

## 👤 Autor

**Leonardo Chapal Díaz**
Estudiante de la especialidad de Dibujo Técnico

- 🐙 [GitHub](https://github.com/LeonardoChapal)
- 💬 WhatsApp: +57 319 310 6380

---

## 📝 Licencia

Material académico de uso educativo.
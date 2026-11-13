import type { Metadata } from "next";

import { site } from "./site";

/**
 * URL pública del sitio, necesaria para que las imágenes de vista previa
 * (og:image) y el sitemap lleven direcciones absolutas.
 *
 * Orden: `SITE_URL` (manual) → dominio de producción de Vercel (solo en
 * producción) → URL del despliegue (previews) → localhost.
 */
export function siteUrl(): string {
  const manual = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (manual) return manual;

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === "production" && production) {
    return `https://${production}`;
  }

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:3000";
}

/** URL de una imagen de Blob servida por el optimizador de Next (1200 px). */
export function sharePreviewImage(blobUrl: string): string {
  return `/_next/image?url=${encodeURIComponent(blobUrl)}&w=1200&q=75`;
}

/**
 * Metadatos de una página pública: título, descripción, canónica y la vista
 * previa al compartir (WhatsApp, Telegram, etc.). Si no se da imagen, se usa
 * la portada del sitio (src/app/opengraph-image.tsx).
 *
 * Ojo: `openGraph` de una página reemplaza al del layout (no se fusionan),
 * por eso se repiten aquí `siteName`, `locale` y `type`.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  /** Sin el nombre del sitio: la plantilla del layout se lo agrega. */
  title: string;
  description: string;
  path: string;
  /** Ruta relativa o URL absoluta de la imagen de vista previa. */
  image?: { url: string; alt: string };
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      locale: "es_CO",
      type: "website",
      // El `openGraph` de la página reemplaza al del layout, y con él la
      // imagen de src/app/opengraph-image.tsx: por eso se repite aquí.
      images: [
        image
          ? { url: image.url, width: 1200, alt: image.alt }
          : {
              url: "/opengraph-image",
              width: 1200,
              height: 630,
              alt: `${site.name} · ${site.subject}`,
            },
      ],
    },
  };
}

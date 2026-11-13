"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import type { LightboxImage } from "./ImageLightbox";

// El visor (y su CSS) solo se descarga la primera vez que se abre una foto.
const ImageLightbox = dynamic(() => import("./ImageLightbox"), { ssr: false });

type PostImage = { id: string; url: string; label: string | null };

/** Nombre de archivo razonable a partir del título y la URL original. */
function fileNameFor(title: string, url: string, index: number): string {
  const extension = /\.([a-z0-9]{2,5})(?:\?|$)/i.exec(url)?.[1] ?? "jpg";
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
  return `${base || "plancha"}-${index + 1}.${extension}`;
}

/**
 * El panel guarda el nombre del archivo como etiqueta por defecto ("1.jpeg"),
 * que no sirve como texto alternativo: en ese caso se usa el título del post.
 */
function describe(label: string | null, title: string, index: number, total: number) {
  const useful = label && !/\.[a-z0-9]{2,5}$/i.test(label.trim());
  const base = useful ? label : title;
  return total > 1 ? `${base} (plancha ${index + 1} de ${total})` : base;
}

/**
 * Miniaturas de las fotos de un post. Al pulsar una se abre el visor con zoom,
 * paneo y descarga. Cada miniatura sigue siendo un enlace real a la imagen
 * (clic central o "abrir en pestaña nueva" siguen funcionando).
 */
export default function PostImages({
  images,
  title,
}: {
  images: PostImage[];
  title: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const slides: LightboxImage[] = images.map((item, index) => ({
    src: item.url,
    alt: describe(item.label, title, index, images.length),
    fileName: fileNameFor(title, item.url, index),
  }));

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((item, index) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ampliar: ${describe(item.label, title, index, images.length)}`}
            onClick={(event) => {
              // Clic normal abre el visor; con Ctrl/Cmd/Mayús o clic central
              // se deja el comportamiento del navegador.
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey
              ) {
                return;
              }
              event.preventDefault();
              setOpenAt(index);
            }}
            className="relative aspect-4/3 cursor-zoom-in border border-blueline/40 transition-colors hover:border-amber"
          >
            <Image
              src={item.url}
              alt={describe(item.label, title, index, images.length)}
              fill
              sizes="(max-width: 640px) 50vw, 240px"
              className="object-cover"
            />
          </a>
        ))}
      </div>

      {openAt !== null ? (
        <ImageLightbox
          images={slides}
          index={openAt}
          onClose={() => setOpenAt(null)}
        />
      ) : null}
    </>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";

/**
 * "Fachada" de YouTube: muestra solo la miniatura y un botón de reproducir.
 * El iframe (que arrastra cientos de KB de JavaScript de YouTube) únicamente
 * se carga cuando el usuario pulsa, así una página con varios videos abre
 * rápido y no contacta a YouTube hasta que alguien lo pide.
 */
export default function YouTubeFacade({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // Al sustituir el botón por el iframe, el foco se perdería: se le devuelve.
  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  const embed = youtubeEmbedUrl(videoId);
  const thumbnail = youtubeThumbnail(videoId);
  if (!embed) return null;

  return (
    <div className="relative mb-4 aspect-video w-full overflow-hidden border border-blueline/40 bg-ferro">
      {playing ? (
        <iframe
          ref={frame}
          src={`${embed}&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir video: ${title}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              // La miniatura hqdefault trae barras negras arriba y abajo:
              // object-cover las recorta en el recuadro 16:9.
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          <span
            aria-hidden
            className="absolute inset-0 bg-ferro/30 transition-colors group-hover:bg-ferro/10"
          />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 border-amber bg-ferro/80 text-amber transition-colors group-hover:bg-amber group-hover:text-ferro"
          >
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

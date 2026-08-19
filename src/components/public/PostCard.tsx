import Image from "next/image";

import type { PostWithMedia } from "@/db/schema";
import { formatDate } from "@/lib/slug";
import { youtubeEmbedUrl } from "@/lib/youtube";

/**
 * Ficha de publicación. Muestra en línea todo lo que el administrador adjuntó:
 * videos de YouTube, videos subidos, fotos y enlaces externos.
 */
export default function PostCard({
  post,
  code,
}: {
  post: PostWithMedia;
  code: string;
}) {
  const youtube = post.media.filter((m) => m.type === "youtube");
  const videos = post.media.filter((m) => m.type === "video_upload");
  const images = post.media.filter((m) => m.type === "image");
  const links = post.media.filter((m) => m.type === "link");

  return (
    <article className="group relative border border-blueline/40 bg-prussian/90 transition-colors duration-300 hover:border-cyan/60">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <header className="flex items-center justify-between gap-4 border-b border-blueline/30 px-5 py-3">
        <span className="tag text-amber">{code}</span>
        <span className="tag text-blueline">{formatDate(post.createdAt)}</span>
      </header>

      <div className="p-5">
        <h3 className="lettering mb-2 text-xl text-chalk transition-colors group-hover:text-cyan">
          {post.title}
        </h3>

        {post.summary ? (
          <p className="mb-4 text-sm leading-relaxed text-graphite">
            {post.summary}
          </p>
        ) : null}

        {post.body ? (
          <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-chalk/80">
            {post.body}
          </p>
        ) : null}

        {/* Videos de YouTube */}
        {youtube.map((item) => {
          const embed = youtubeEmbedUrl(item.url);
          if (!embed) return null;
          return (
            <div
              key={item.id}
              className="mb-4 aspect-video w-full border border-blueline/40"
            >
              <iframe
                src={embed}
                title={item.label ?? post.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          );
        })}

        {/* Videos subidos */}
        {videos.map((item) => (
          <video
            key={item.id}
            src={item.url}
            controls
            preload="metadata"
            className="mb-4 w-full border border-blueline/40 bg-ferro"
          >
            Tu navegador no puede reproducir este video.
          </video>
        ))}

        {/* Fotos */}
        {images.length > 0 ? (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-4/3 border border-blueline/40 transition-colors hover:border-amber"
              >
                <Image
                  src={item.url}
                  alt={item.label ?? post.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 240px"
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        ) : null}

        {/* Enlaces externos */}
        {links.length > 0 ? (
          <ul className="flex flex-col gap-1.5 border-t border-blueline/30 pt-4">
            {links.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tag inline-flex items-center gap-2 normal-case tracking-normal text-cyan transition-colors hover:text-amber"
                >
                  <span aria-hidden>↗</span>
                  {item.label ?? item.url}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

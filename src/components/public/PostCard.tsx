import PostImages from "@/components/public/PostImages";
import YouTubeFacade from "@/components/public/YouTubeFacade";
import type { PostWithMedia } from "@/db/schema";
import { formatDate } from "@/lib/slug";
import { youtubeId } from "@/lib/youtube";

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
        <span className="tag text-label">{formatDate(post.createdAt)}</span>
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
          const videoId = youtubeId(item.url);
          if (!videoId) return null;
          // Miniatura primero; el iframe de YouTube solo se carga al pulsar.
          return (
            <YouTubeFacade
              key={item.id}
              videoId={videoId}
              title={item.label ?? post.title}
            />
          );
        })}

        {/* Videos subidos: solo el primero de la ficha descarga metadatos
            (y un primer cuadro como portada); el resto espera a que se
            pulse reproducir. */}
        {videos.map((item, index) => (
          <video
            key={item.id}
            src={index === 0 ? `${item.url}#t=0.001` : item.url}
            controls
            playsInline
            preload={index === 0 ? "metadata" : "none"}
            aria-label={item.label ?? post.title}
            className="mb-4 w-full border border-blueline/40 bg-ferro"
          >
            Tu navegador no puede reproducir este video.
          </video>
        ))}

        {/* Fotos */}
        {images.length > 0 ? (
          <PostImages
            title={post.title}
            images={images.map(({ id, url, label }) => ({ id, url, label }))}
          />
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

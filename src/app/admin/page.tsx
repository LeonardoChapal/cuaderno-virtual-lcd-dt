import Link from "next/link";

import { isDatabaseConfigured } from "@/db";
import { listAllPosts } from "@/lib/posts";
import {
  SECTION_LABELS,
  SUBSECTION_LABELS,
  getSectionByValue,
  getPlano,
} from "@/lib/site";
import { formatDate } from "@/lib/slug";

import { deletePost } from "./actions";

export const dynamic = "force-dynamic";

const MEDIA_LABELS: Record<string, string> = {
  video_upload: "video",
  youtube: "YouTube",
  image: "foto",
  link: "enlace",
};

export default async function AdminHome() {
  const posts = await listAllPosts();

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-blueline/30 pb-5">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-[0.08em] text-chalk">
            Publicaciones
          </h1>
          <p className="mt-1 text-sm text-graphite">
            {posts.length === 0
              ? "Aún no hay publicaciones."
              : `${posts.length} ${posts.length === 1 ? "publicación" : "publicaciones"} en el cuaderno.`}
          </p>
        </div>

        <Link
          href="/admin/posts/nuevo"
          className="tag border border-amber bg-amber px-5 py-3 text-ferro transition-colors hover:bg-transparent hover:text-amber"
        >
          Crear publicación
        </Link>
      </header>

      {!isDatabaseConfigured ? (
        <p className="mb-6 border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm text-amber">
          Falta <code className="font-mono">DATABASE_URL</code>. Conecta la base
          de datos de Neon para poder guardar publicaciones.
        </p>
      ) : null}

      {posts.length === 0 ? (
        <div className="border border-dashed border-blueline/40 px-6 py-16 text-center">
          <p className="mb-2 font-display text-lg uppercase tracking-wide text-graphite">
            Empieza por la primera publicación
          </p>
          <p className="text-sm text-graphite/70">
            Elige a qué sección y subsección pertenece, y adjunta videos, fotos
            o enlaces.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => {
            const sectionDef = getSectionByValue(post.section);
            const plano =
              sectionDef && post.planoSlug
                ? getPlano(sectionDef, post.planoSlug)
                : undefined;

            const counts = post.media.reduce<Record<string, number>>(
              (acc, item) => {
                acc[item.type] = (acc[item.type] ?? 0) + 1;
                return acc;
              },
              {},
            );

            return (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 border border-blueline/40 bg-prussian/90 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="tag text-amber">
                      {SECTION_LABELS[post.section]}
                    </span>
                    <span className="tag text-blueline">/</span>
                    <span className="tag text-blueline">
                      {SUBSECTION_LABELS[post.subsection]}
                    </span>
                    {plano ? (
                      <>
                        <span className="tag text-blueline">/</span>
                        <span className="tag text-cyan">{plano.title}</span>
                      </>
                    ) : null}
                    {!post.published ? (
                      <span className="tag border border-graphite/40 px-2 py-0.5 text-graphite">
                        Borrador
                      </span>
                    ) : null}
                  </div>

                  <p className="truncate font-display text-lg uppercase tracking-wide text-chalk">
                    {post.title}
                  </p>

                  <p className="tag mt-1.5 text-blueline">
                    {formatDate(post.updatedAt)}
                    {post.media.length > 0
                      ? ` · ${Object.entries(counts)
                          .map(
                            ([type, count]) =>
                              `${count} ${MEDIA_LABELS[type] ?? type}`,
                          )
                          .join(", ")}`
                      : " · sin adjuntos"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="tag border border-blueline/50 px-4 py-2.5 text-chalk transition-colors hover:border-cyan hover:text-cyan"
                  >
                    Editar
                  </Link>
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="tag border border-blueline/50 px-4 py-2.5 text-graphite transition-colors hover:border-amber hover:text-amber"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

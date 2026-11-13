import Link from "next/link";

import SortablePostGroup, {
  type AdminPostItem,
} from "@/components/admin/SortablePostGroup";
import { isDatabaseConfigured } from "@/db";
import type { PostWithMedia } from "@/db/schema";
import { listAllPosts } from "@/lib/posts";
import {
  SECTIONS,
  SUBSECTION_LABELS,
  getPlano,
  getSectionByValue,
} from "@/lib/site";
import { formatDate } from "@/lib/slug";

export const dynamic = "force-dynamic";

const MEDIA_LABELS: Record<string, string> = {
  video_upload: "video",
  youtube: "YouTube",
  image: "foto",
  link: "enlace",
};

type Group = { key: string; title: string; rank: number; posts: PostWithMedia[] };

function describeMedia(post: PostWithMedia): string {
  if (post.media.length === 0) return "sin adjuntos";
  const counts = post.media.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([type, count]) => `${count} ${MEDIA_LABELS[type] ?? type}`)
    .join(", ");
}

/**
 * Agrupa por sección + subsección + plano, que es lo que lista cada página
 * pública, y ordena los grupos como la navegación del sitio (§7). Dentro de
 * cada grupo, el mismo orden que el sitio: `position` y luego más reciente.
 */
function groupPosts(posts: PostWithMedia[]): Group[] {
  const groups = new Map<string, Group>();

  for (const post of posts) {
    const sectionIndex = SECTIONS.findIndex((item) => item.value === post.section);
    const section = getSectionByValue(post.section);
    const subIndex = section?.order.indexOf(post.subsection) ?? 9;
    const plano =
      section && post.planoSlug ? getPlano(section, post.planoSlug) : undefined;
    const planoIndex =
      section && post.planoSlug
        ? section.planos.findIndex((item) => item.slug === post.planoSlug)
        : -1;

    const key = `${post.section}|${post.subsection}|${post.planoSlug ?? ""}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: [
          section?.title ?? post.section,
          SUBSECTION_LABELS[post.subsection],
          post.planoSlug ? (plano?.title ?? post.planoSlug) : null,
        ]
          .filter(Boolean)
          .join(" / "),
        // Orden de la navegación: sección → subsección → plano.
        rank: sectionIndex * 10_000 + subIndex * 100 + (planoIndex + 1),
        posts: [],
      });
    }
    groups.get(key)!.posts.push(post);
  }

  return [...groups.values()]
    .sort((a, b) => a.rank - b.rank)
    .map((group) => ({
      ...group,
      posts: group.posts.sort(
        (a, b) =>
          a.position - b.position ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    }));
}

export default async function AdminHome() {
  const posts = await listAllPosts();
  const groups = groupPosts(posts);

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
              : `${posts.length} ${posts.length === 1 ? "publicación" : "publicaciones"} en el cuaderno, agrupadas como en el sitio. El orden de cada grupo es el que se ve en público.`}
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
          <p className="text-sm text-graphite">
            Elige a qué sección y subsección pertenece, y adjunta videos, fotos
            o enlaces.
          </p>
        </div>
      ) : (
        groups.map((group) => {
          const items: AdminPostItem[] = group.posts.map((post) => ({
            id: post.id,
            title: post.title,
            published: post.published,
            meta: `${formatDate(post.updatedAt)} · ${describeMedia(post)}`,
          }));
          return (
            <SortablePostGroup
              // Cambia solo si entra o sale una publicación del grupo (no al
              // reordenar): así la lista se reinicia tras eliminar o crear.
              key={`${group.key}:${items
                .map((item) => item.id)
                .sort()
                .join(",")}`}
              title={group.title}
              items={items}
            />
          );
        })
      )}
    </>
  );
}

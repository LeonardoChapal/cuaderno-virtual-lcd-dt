import type { PostWithMedia } from "@/db/schema";

import { formatDate } from "./slug";
import {
  type SubsectionKey,
  getPlano,
  getSectionByValue,
  getSubsection,
  planoHref,
  subsectionHref,
} from "./site";

/** Publicación reducida a lo que necesita el buscador (serializable). */
export type SearchItem = {
  id: string;
  title: string;
  /** Resumen o, si no hay, el comienzo del contenido. */
  snippet: string;
  /** Texto buscable ya normalizado (título, resumen, contenido, etiquetas…). */
  haystack: string;
  /** Título normalizado, para dar más peso a las coincidencias en él. */
  titleNormalized: string;
  sectionSlug: string;
  sectionTitle: string;
  subsection: SubsectionKey;
  subsectionTitle: string;
  planoTitle: string | null;
  href: string;
  cover: string | null;
  date: string;
  counts: { images: number; videos: number; links: number };
};

/** Minúsculas y sin acentos: "Calderería" coincide con "caldereria". */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function buildSearchItems(posts: PostWithMedia[]): SearchItem[] {
  return posts.flatMap((post): SearchItem[] => {
    const section = getSectionByValue(post.section);
    if (!section) return [];

    const sub = getSubsection(post.subsection);
    const plano = post.planoSlug ? getPlano(section, post.planoSlug) : undefined;
    const images = post.media.filter((item) => item.type === "image");
    const body = post.body?.replace(/\s+/g, " ").trim() ?? "";

    const searchable = [
      post.title,
      post.summary,
      post.body,
      plano?.title,
      section.title,
      sub.title,
      ...post.media.map((item) => item.label),
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        id: post.id,
        title: post.title,
        snippet: post.summary?.trim() || (body.length > 180 ? `${body.slice(0, 177)}…` : body),
        haystack: normalizeText(searchable),
        titleNormalized: normalizeText(post.title),
        sectionSlug: section.slug,
        sectionTitle: section.title,
        subsection: post.subsection,
        subsectionTitle: sub.title,
        planoTitle: plano?.title ?? null,
        href: plano
          ? planoHref(section, plano)
          : subsectionHref(section, post.subsection),
        cover: images[0]?.url ?? null,
        date: formatDate(post.createdAt),
        counts: {
          images: images.length,
          videos: post.media.filter(
            (item) => item.type === "video_upload" || item.type === "youtube",
          ).length,
          links: post.media.filter((item) => item.type === "link").length,
        },
      },
    ];
  });
}

/**
 * Filtra y ordena. Cada palabra de la búsqueda debe aparecer en alguna parte
 * del texto; las coincidencias en el título pesan más. Sin texto de búsqueda
 * se conserva el orden recibido (más recientes primero).
 */
export function searchItems(
  items: SearchItem[],
  { query, section, type }: { query: string; section: string; type: string },
): SearchItem[] {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);

  const scored = items
    .filter(
      (item) =>
        (!section || item.sectionSlug === section) &&
        (!type || item.subsection === type),
    )
    .map((item, index) => {
      let score = 0;
      for (const term of terms) {
        if (!item.haystack.includes(term)) return null;
        score += item.titleNormalized.includes(term) ? 3 : 1;
      }
      return { item, score, index };
    })
    .filter((entry) => entry !== null);

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

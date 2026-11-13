import { and, asc, desc, eq } from "drizzle-orm";

import { tryGetDb } from "@/db";
import {
  postMedia,
  posts,
  type PostWithMedia,
  type SectionSlug,
  type SubsectionSlug,
} from "@/db/schema";
import { previewDiag, safeErrorMessage } from "@/lib/diag";

/**
 * Todas las consultas degradan a lista vacía cuando aún no hay base de datos
 * configurada, para que el sitio público se pueda construir y visitar antes
 * de conectar Neon.
 */

type ListOptions = {
  section: SectionSlug;
  subsection: SubsectionSlug;
  planoSlug?: string;
  includeUnpublished?: boolean;
};

export async function listPosts({
  section,
  subsection,
  planoSlug,
  includeUnpublished = false,
}: ListOptions): Promise<PostWithMedia[]> {
  const consulta = { section, subsection, planoSlug: planoSlug ?? null };

  const db = tryGetDb();
  if (!db) {
    previewDiag("listPosts sin base de datos", { ...consulta, postsDevueltos: 0 });
    return [];
  }

  const filters = [eq(posts.section, section), eq(posts.subsection, subsection)];
  if (planoSlug) filters.push(eq(posts.planoSlug, planoSlug));
  if (!includeUnpublished) filters.push(eq(posts.published, true));

  try {
    const rows = await db.query.posts.findMany({
      where: and(...filters),
      orderBy: [asc(posts.position), desc(posts.createdAt)],
      with: { media: { orderBy: [asc(postMedia.position)] } },
    });
    previewDiag("listPosts", { ...consulta, postsDevueltos: rows.length });
    return rows;
  } catch (error) {
    console.error("[posts] listPosts falló:", safeErrorMessage(error));
    previewDiag("listPosts con error", { ...consulta, postsDevueltos: 0 });
    return [];
  }
}

/** Publicaciones más recientes del sitio, para el hero de /home. */
export async function listRecentPosts(limit = 4): Promise<PostWithMedia[]> {
  const db = tryGetDb();
  if (!db) return [];

  try {
    return await db.query.posts.findMany({
      where: eq(posts.published, true),
      orderBy: [desc(posts.createdAt)],
      limit,
      with: { media: { orderBy: [asc(postMedia.position)] } },
    });
  } catch (error) {
    console.error("[posts] listRecentPosts falló:", safeErrorMessage(error));
    return [];
  }
}

/** Todas las publicaciones, para el panel de administración. */
export async function listAllPosts(): Promise<PostWithMedia[]> {
  const db = tryGetDb();
  if (!db) return [];

  try {
    return await db.query.posts.findMany({
      orderBy: [desc(posts.updatedAt)],
      with: { media: { orderBy: [asc(postMedia.position)] } },
    });
  } catch (error) {
    console.error("[posts] listAllPosts falló:", safeErrorMessage(error));
    return [];
  }
}

export async function getPostById(id: string): Promise<PostWithMedia | null> {
  const db = tryGetDb();
  if (!db) return null;

  try {
    const record = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: { media: { orderBy: [asc(postMedia.position)] } },
    });
    return record ?? null;
  } catch (error) {
    console.error("[posts] getPostById falló:", safeErrorMessage(error));
    return null;
  }
}

/** Conteo por subsección, usado para las estadísticas de /home. */
export async function countPosts(): Promise<number> {
  const db = tryGetDb();
  if (!db) return 0;

  try {
    const rows = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.published, true));
    return rows.length;
  } catch (error) {
    console.error("[posts] countPosts falló:", safeErrorMessage(error));
    return 0;
  }
}

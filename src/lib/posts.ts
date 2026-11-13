import { and, asc, desc, eq } from "drizzle-orm";

import { tryGetDb } from "@/db";
import {
  postMedia,
  posts,
  type PostWithMedia,
  type SectionSlug,
  type SubsectionSlug,
} from "@/db/schema";
import { safeErrorMessage } from "@/lib/diag";

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
  const db = tryGetDb();
  if (!db) return [];

  const filters = [eq(posts.section, section), eq(posts.subsection, subsection)];
  if (planoSlug) filters.push(eq(posts.planoSlug, planoSlug));
  if (!includeUnpublished) filters.push(eq(posts.published, true));

  try {
    return await db.query.posts.findMany({
      where: and(...filters),
      orderBy: [asc(posts.position), desc(posts.createdAt)],
      with: { media: { orderBy: [asc(postMedia.position)] } },
    });
  } catch (error) {
    console.error("[posts] listPosts falló:", safeErrorMessage(error));
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

"use server";

import { and, eq, inArray, isNull, min, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { tryGetDb } from "@/db";
import {
  type SectionSlug,
  type SubsectionSlug,
  postMedia,
  posts,
} from "@/db/schema";
import { safeErrorMessage } from "@/lib/diag";
import { type MediaInput, parseMediaInput } from "@/lib/media-input";
import { getSectionByValue } from "@/lib/site";
import { slugify } from "@/lib/slug";

export type ActionState = { error?: string };

const SECTION_VALUES: SectionSlug[] = [
  "diseno_aplicado",
  "fundamentacion_tecnologica",
];
const SUBSECTION_VALUES: SubsectionSlug[] = ["videos", "consultas", "planos"];

/** Toda acción del panel exige sesión activa. */
async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
}

/** Filas de post_media para un post, en el orden recibido. */
function mediaRows(postId: string, media: MediaInput[]) {
  return media.map((item, index) => ({
    postId,
    type: item.type,
    url: item.url,
    label: item.label ?? null,
    fileName: item.fileName ?? null,
    fileSize: item.fileSize ?? null,
    position: index,
  }));
}

/** Refresca las páginas públicas afectadas por un cambio. */
function revalidateFor(
  section: SectionSlug,
  subsection: SubsectionSlug,
  planoSlug: string | null,
) {
  const def = getSectionByValue(section);
  if (!def) return;

  revalidatePath("/home");
  revalidatePath("/buscar");
  revalidatePath(`/${def.slug}`);
  revalidatePath(`/${def.slug}/${subsection}`);
  if (subsection === "planos" && planoSlug) {
    revalidatePath(`/${def.slug}/planos/${planoSlug}`);
  }
}

type Group = {
  section: SectionSlug;
  subsection: SubsectionSlug;
  planoSlug: string | null;
};

/** Condición SQL de "mismo grupo": misma sección, subsección y plano. */
function sameGroup(group: Group) {
  return and(
    eq(posts.section, group.section),
    eq(posts.subsection, group.subsection),
    group.planoSlug === null
      ? isNull(posts.planoSlug)
      : eq(posts.planoSlug, group.planoSlug),
  );
}

type Database = NonNullable<ReturnType<typeof tryGetDb>>;

/**
 * Posición para que un post quede el primero de su grupo (el orden público
 * es `position` ascendente). En un grupo vacío, 0.
 */
async function firstPositionIn(db: Database, group: Group): Promise<number> {
  const [row] = await db
    .select({ value: min(posts.position) })
    .from(posts)
    .where(sameGroup(group));
  return row?.value === null || row?.value === undefined ? 0 : row.value - 1;
}

type ParsedForm = {
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  section: SectionSlug;
  subsection: SubsectionSlug;
  planoSlug: string | null;
  published: boolean;
  media: MediaInput[];
};

function parseForm(formData: FormData): ParsedForm | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "El título es obligatorio." };

  const section = String(formData.get("section") ?? "") as SectionSlug;
  if (!SECTION_VALUES.includes(section)) {
    return { error: "Selecciona una sección válida." };
  }

  const subsection = String(formData.get("subsection") ?? "") as SubsectionSlug;
  if (!SUBSECTION_VALUES.includes(subsection)) {
    return { error: "Selecciona una subsección válida." };
  }

  const sectionDef = getSectionByValue(section);
  let planoSlug: string | null = null;

  if (subsection === "planos") {
    planoSlug = String(formData.get("planoSlug") ?? "").trim() || null;
    if (!planoSlug) {
      return { error: "Elige a qué plano pertenece la publicación." };
    }
    if (!sectionDef?.planos.some((plano) => plano.slug === planoSlug)) {
      return { error: "Ese plano no pertenece a la sección elegida." };
    }
  }

  const media = parseMediaInput(formData.get("media"));
  if ("error" in media) return media;

  const customSlug = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugify(customSlug || title) || `post-${Date.now()}`,
    summary: String(formData.get("summary") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
    section,
    subsection,
    planoSlug,
    published: formData.get("published") === "on",
    media,
  };
}

/* -------------------------------------------------------------------------
 * Crear
 * ---------------------------------------------------------------------- */

export async function createPost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const db = tryGetDb();
  if (!db) {
    return {
      error: "No hay conexión con la base de datos (falta DATABASE_URL).",
    };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  try {
    // El id se genera aquí para poder insertar el post y sus adjuntos en
    // una sola transacción (db.batch no deja leer resultados intermedios).
    const id = crypto.randomUUID();
    // Las publicaciones nuevas entran las primeras de su grupo; luego se
    // pueden mover arrastrando en el panel.
    const position = await firstPositionIn(db, parsed);

    const insertPost = db.insert(posts).values({
      id,
      title: parsed.title,
      slug: `${parsed.slug}-${Date.now().toString(36)}`,
      summary: parsed.summary,
      body: parsed.body,
      section: parsed.section,
      subsection: parsed.subsection,
      planoSlug: parsed.planoSlug,
      published: parsed.published,
      position,
    });

    if (parsed.media.length > 0) {
      // Todo o nada: si falla un adjunto, tampoco se crea el post.
      await db.batch([
        insertPost,
        db.insert(postMedia).values(mediaRows(id, parsed.media)),
      ]);
    } else {
      await insertPost;
    }

    revalidateFor(parsed.section, parsed.subsection, parsed.planoSlug);
  } catch (error) {
    console.error("[admin] createPost falló:", safeErrorMessage(error));
    return { error: "No se pudo guardar la publicación. Inténtalo de nuevo." };
  }

  redirect("/admin");
}

/* -------------------------------------------------------------------------
 * Editar
 * ---------------------------------------------------------------------- */

export async function updatePost(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const db = tryGetDb();
  if (!db) {
    return {
      error: "No hay conexión con la base de datos (falta DATABASE_URL).",
    };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  try {
    const [previous] = await db
      .select({
        section: posts.section,
        subsection: posts.subsection,
        planoSlug: posts.planoSlug,
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!previous) {
      return { error: "Esta publicación ya no existe." };
    }

    // El orden se cambia arrastrando en el panel, no desde aquí. Solo si la
    // publicación cambia de grupo entra la primera en el nuevo.
    const movedGroup =
      previous.section !== parsed.section ||
      previous.subsection !== parsed.subsection ||
      previous.planoSlug !== parsed.planoSlug;
    const newPosition = movedGroup
      ? await firstPositionIn(db, parsed)
      : undefined;

    const updatePostRow = db
      .update(posts)
      .set({
        title: parsed.title,
        summary: parsed.summary,
        body: parsed.body,
        section: parsed.section,
        subsection: parsed.subsection,
        planoSlug: parsed.planoSlug,
        published: parsed.published,
        ...(newPosition === undefined ? {} : { position: newPosition }),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    // Se reemplaza la lista de adjuntos por la enviada desde el formulario.
    // Va en una sola transacción: si el INSERT falla, el DELETE se deshace
    // y el post conserva sus adjuntos anteriores.
    const deleteMedia = db.delete(postMedia).where(eq(postMedia.postId, id));

    if (parsed.media.length > 0) {
      await db.batch([
        updatePostRow,
        deleteMedia,
        db.insert(postMedia).values(mediaRows(id, parsed.media)),
      ]);
    } else {
      await db.batch([updatePostRow, deleteMedia]);
    }

    // Refresca tanto el destino nuevo como el anterior, por si se movió.
    revalidateFor(previous.section, previous.subsection, previous.planoSlug);
    revalidateFor(parsed.section, parsed.subsection, parsed.planoSlug);
  } catch (error) {
    console.error("[admin] updatePost falló:", safeErrorMessage(error));
    return { error: "No se pudo actualizar la publicación." };
  }

  redirect("/admin");
}

/* -------------------------------------------------------------------------
 * Eliminar
 * ---------------------------------------------------------------------- */

export async function deletePost(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = tryGetDb();
  if (!db) return;

  try {
    const [previous] = await db
      .select({
        section: posts.section,
        subsection: posts.subsection,
        planoSlug: posts.planoSlug,
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    // post_media tiene ON DELETE CASCADE, así que se borra junto con el post.
    await db.delete(posts).where(eq(posts.id, id));

    if (previous) {
      revalidateFor(previous.section, previous.subsection, previous.planoSlug);
    }
  } catch (error) {
    console.error("[admin] deletePost falló:", safeErrorMessage(error));
  }

  revalidatePath("/admin");
}

/* -------------------------------------------------------------------------
 * Reordenar (arrastrar en el panel)
 * ---------------------------------------------------------------------- */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guarda el orden de un grupo (sección + subsección + plano): cada post recibe
 * como `position` su índice en `ids`. Exige que `ids` sea exactamente el
 * grupo completo, para no mezclar órdenes si la lista cambió en otra pestaña.
 * No toca `updated_at`: reordenar no es editar el contenido.
 */
export async function reorderPosts(ids: string[]): Promise<ActionState> {
  await requireSession();

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.length > 500 ||
    !ids.every((id) => typeof id === "string" && UUID_RE.test(id)) ||
    new Set(ids).size !== ids.length
  ) {
    return { error: "El orden recibido no es válido. Recarga la página." };
  }

  const db = tryGetDb();
  if (!db) {
    return { error: "No hay conexión con la base de datos." };
  }

  try {
    const rows = await db
      .select({
        id: posts.id,
        section: posts.section,
        subsection: posts.subsection,
        planoSlug: posts.planoSlug,
      })
      .from(posts)
      .where(inArray(posts.id, ids));

    if (rows.length !== ids.length) {
      return { error: "Alguna publicación ya no existe. Recarga la página." };
    }

    const [first] = rows;
    const group: Group = {
      section: first.section,
      subsection: first.subsection,
      planoSlug: first.planoSlug,
    };
    if (
      rows.some(
        (row) =>
          row.section !== group.section ||
          row.subsection !== group.subsection ||
          row.planoSlug !== group.planoSlug,
      )
    ) {
      return { error: "Solo se puede ordenar dentro de un mismo grupo." };
    }

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(posts)
      .where(sameGroup(group));
    if (total !== ids.length) {
      return { error: "La lista cambió mientras tanto. Recarga la página." };
    }

    // Todas las posiciones en una sola transacción.
    const updates = ids.map((id, index) =>
      db.update(posts).set({ position: index }).where(eq(posts.id, id)),
    );
    await db.batch(updates as [(typeof updates)[number], ...typeof updates]);

    revalidateFor(group.section, group.subsection, group.planoSlug);
    revalidatePath("/admin");
    return {};
  } catch (error) {
    console.error("[admin] reorderPosts falló:", safeErrorMessage(error));
    return { error: "No se pudo guardar el orden. Inténtalo de nuevo." };
  }
}

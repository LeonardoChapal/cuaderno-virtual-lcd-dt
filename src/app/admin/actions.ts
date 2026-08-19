"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { tryGetDb } from "@/db";
import {
  type MediaType,
  type SectionSlug,
  type SubsectionSlug,
  postMedia,
  posts,
} from "@/db/schema";
import { getSectionByValue } from "@/lib/site";
import { slugify } from "@/lib/slug";

export type ActionState = { error?: string };

const MEDIA_TYPES: MediaType[] = ["video_upload", "youtube", "image", "link"];
const SECTION_VALUES: SectionSlug[] = [
  "diseno_aplicado",
  "fundamentacion_tecnologica",
];
const SUBSECTION_VALUES: SubsectionSlug[] = ["videos", "consultas", "planos"];

type MediaInput = {
  type: MediaType;
  url: string;
  label?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

/** Toda acción del panel exige sesión activa. */
async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
}

function parseMedia(raw: FormDataEntryValue | null): MediaInput[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item): MediaInput[] => {
    if (typeof item !== "object" || item === null) return [];
    const candidate = item as Record<string, unknown>;
    const type = candidate.type as MediaType;
    const url = String(candidate.url ?? "").trim();
    if (!MEDIA_TYPES.includes(type) || !url) return [];

    return [
      {
        type,
        url,
        label: candidate.label ? String(candidate.label).slice(0, 200) : null,
        fileName: candidate.fileName ? String(candidate.fileName) : null,
        fileSize:
          typeof candidate.fileSize === "number" ? candidate.fileSize : null,
      },
    ];
  });
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
  revalidatePath(`/${def.slug}`);
  revalidatePath(`/${def.slug}/${subsection}`);
  if (subsection === "planos" && planoSlug) {
    revalidatePath(`/${def.slug}/planos/${planoSlug}`);
  }
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
  position: number;
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
    position: Number(formData.get("position") ?? 0) || 0,
    media: parseMedia(formData.get("media")),
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
    const [created] = await db
      .insert(posts)
      .values({
        title: parsed.title,
        slug: `${parsed.slug}-${Date.now().toString(36)}`,
        summary: parsed.summary,
        body: parsed.body,
        section: parsed.section,
        subsection: parsed.subsection,
        planoSlug: parsed.planoSlug,
        published: parsed.published,
        position: parsed.position,
      })
      .returning({ id: posts.id });

    if (parsed.media.length > 0) {
      await db.insert(postMedia).values(
        parsed.media.map((item, index) => ({
          postId: created.id,
          type: item.type,
          url: item.url,
          label: item.label ?? null,
          fileName: item.fileName ?? null,
          fileSize: item.fileSize ?? null,
          position: index,
        })),
      );
    }

    revalidateFor(parsed.section, parsed.subsection, parsed.planoSlug);
  } catch (error) {
    console.error("[admin] createPost falló:", error);
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

    await db
      .update(posts)
      .set({
        title: parsed.title,
        summary: parsed.summary,
        body: parsed.body,
        section: parsed.section,
        subsection: parsed.subsection,
        planoSlug: parsed.planoSlug,
        published: parsed.published,
        position: parsed.position,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    // Se reemplaza la lista de adjuntos por la enviada desde el formulario.
    await db.delete(postMedia).where(eq(postMedia.postId, id));
    if (parsed.media.length > 0) {
      await db.insert(postMedia).values(
        parsed.media.map((item, index) => ({
          postId: id,
          type: item.type,
          url: item.url,
          label: item.label ?? null,
          fileName: item.fileName ?? null,
          fileSize: item.fileSize ?? null,
          position: index,
        })),
      );
    }

    // Refresca tanto el destino nuevo como el anterior, por si se movió.
    if (previous) {
      revalidateFor(previous.section, previous.subsection, previous.planoSlug);
    }
    revalidateFor(parsed.section, parsed.subsection, parsed.planoSlug);
  } catch (error) {
    console.error("[admin] updatePost falló:", error);
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
    console.error("[admin] deletePost falló:", error);
  }

  revalidatePath("/admin");
}

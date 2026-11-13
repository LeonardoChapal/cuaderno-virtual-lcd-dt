import type { MediaType } from "@/db/schema";

import { youtubeId } from "./youtube";

export type MediaInput = {
  type: MediaType;
  url: string;
  label: string | null;
  fileName: string | null;
  fileSize: number | null;
};

const MEDIA_TYPES: MediaType[] = ["video_upload", "youtube", "image", "link"];

/** Mismo patrón que `images.remotePatterns` de next.config.ts. */
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

const MAX_INT = 2_147_483_647; // tope de una columna integer de Postgres
const MAX_MEDIA = 60;

export function isBlobUrl(url: URL): boolean {
  return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX);
}

/**
 * Valida y normaliza los adjuntos que llegan del formulario (JSON). Ante
 * cualquier dato inválido devuelve un error legible en vez de descartar el
 * adjunto en silencio: así el administrador sabe qué corregir.
 *
 * - `image` y `video_upload`: deben ser URLs https del Blob de Vercel.
 * - `youtube`: debe contener un id de video válido.
 * - `link`: debe ser http(s).
 */
export function parseMediaInput(
  raw: FormDataEntryValue | null,
): MediaInput[] | { error: string } {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return { error: "La lista de adjuntos llegó dañada. Recarga la página." };
  }
  if (!Array.isArray(parsed)) {
    return { error: "La lista de adjuntos llegó dañada. Recarga la página." };
  }
  if (parsed.length > MAX_MEDIA) {
    return { error: `Máximo ${MAX_MEDIA} adjuntos por publicación.` };
  }

  const result: MediaInput[] = [];

  for (const [index, item] of parsed.entries()) {
    const n = index + 1;
    if (typeof item !== "object" || item === null) {
      return { error: `El adjunto ${n} no es válido.` };
    }
    const candidate = item as Record<string, unknown>;
    const type = candidate.type as MediaType;
    const value = String(candidate.url ?? "").trim();

    if (!MEDIA_TYPES.includes(type)) {
      return { error: `El adjunto ${n} tiene un tipo desconocido.` };
    }
    if (!value) {
      return { error: `Al adjunto ${n} le falta la dirección (URL).` };
    }

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return { error: `El adjunto ${n} no tiene una dirección válida.` };
    }

    if (type === "image" || type === "video_upload") {
      if (!isBlobUrl(url)) {
        return {
          error: `El adjunto ${n} debe ser un archivo subido desde el panel.`,
        };
      }
    } else if (type === "youtube") {
      if (!youtubeId(value)) {
        return { error: `El adjunto ${n} no parece un video de YouTube.` };
      }
    } else if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { error: `El enlace del adjunto ${n} debe empezar por https://.` };
    }

    const size = candidate.fileSize;
    result.push({
      type,
      url: value,
      label: candidate.label ? String(candidate.label).slice(0, 200) : null,
      fileName: candidate.fileName
        ? String(candidate.fileName).slice(0, 255)
        : null,
      fileSize:
        typeof size === "number" &&
        Number.isInteger(size) &&
        size >= 0 &&
        size <= MAX_INT
          ? size
          : null,
    });
  }

  return result;
}

/** Entero válido para la columna `position` (acepta decimales y basura). */
export function parsePosition(raw: FormDataEntryValue | null): number {
  const value = Math.trunc(Number(raw ?? 0));
  if (!Number.isFinite(value)) return 0;
  return Math.max(-MAX_INT, Math.min(MAX_INT, value));
}

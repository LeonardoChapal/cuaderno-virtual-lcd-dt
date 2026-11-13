/**
 * Reglas de subida compartidas por el servidor (/api/upload, que es quien
 * las hace cumplir) y el panel (que avisa antes de empezar a subir).
 */

export const IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const VIDEO_CONTENT_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const ALLOWED_CONTENT_TYPES: readonly string[] = [
  ...IMAGE_CONTENT_TYPES,
  ...VIDEO_CONTENT_TYPES,
];

/** Tope por defecto (MB); en el servidor se puede cambiar con MAX_UPLOAD_MB. */
export const DEFAULT_MAX_UPLOAD_MB = 300;

/**
 * Por encima de este tamaño la subida va en partes (multipart): más robusta
 * para videos grandes. Para fotos, una sola petición es más rápida.
 */
export const MULTIPART_THRESHOLD_BYTES = 20 * 1024 * 1024;

/**
 * Convierte un error de subida en un mensaje que el administrador pueda
 * entender y sobre el que pueda actuar.
 */
export function uploadErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  const message = raw.toLowerCase();

  if (message.includes("content type") || message.includes("contenttype")) {
    return "Ese formato no está permitido. Fotos: JPG, PNG, WebP, GIF o AVIF. Videos: MP4, WebM o MOV.";
  }
  if (message.includes("too large") || message.includes("filetoolarge")) {
    return "El archivo supera el tamaño máximo permitido.";
  }
  if (message.includes("rate") && message.includes("limit")) {
    return "Demasiadas subidas seguidas. Espera un momento y pulsa Reintentar.";
  }
  if (
    message.includes("autorizado") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("token")
  ) {
    return "La sesión caducó o no tiene permiso. Inicia sesión de nuevo en otra pestaña y pulsa Reintentar.";
  }
  if (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("load failed") ||
    (typeof navigator !== "undefined" && !navigator.onLine)
  ) {
    return "Se cortó la conexión. Revisa internet y pulsa Reintentar.";
  }
  return "No se pudo subir el archivo. Pulsa Reintentar; si sigue fallando, prueba con otro archivo.";
}

import { getDatabaseHost } from "./db-guard";

/**
 * Mensaje de un error apto para los logs: nunca incluye cadenas de conexión
 * (por si algún driver las mete en el mensaje).
 */
export function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/postgres(ql)?:\/\/\S+/gi, "[cadena de conexión oculta]");
}

/**
 * DIAGNÓSTICO TEMPORAL del preview de `mejoras` (2026-11-12). Solo escribe
 * cuando VERCEL_ENV === "preview". Imprime el host de la base (nunca usuario
 * ni contraseña), la rama del despliegue y si la guarda actuaría.
 * Se quita en cuanto el preview funcione.
 */
export function previewDiag(context: string, extra: Record<string, unknown> = {}) {
  if (process.env.VERCEL_ENV !== "preview") return;

  const url = process.env.DATABASE_URL;
  console.log(
    `[diag-preview] ${context}`,
    JSON.stringify({
      rama: process.env.VERCEL_GIT_COMMIT_REF ?? "(desconocida)",
      databaseUrlDefinida: Boolean(url),
      host: url ? getDatabaseHost(url) : null,
      // La guarda (db-guard) no actúa dentro de Vercel: existe VERCEL_ENV.
      guardaActiva: !process.env.VERCEL_ENV,
      blobTokenDefinido: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      authSecretDefinido: Boolean(process.env.AUTH_SECRET),
      ...extra,
    }),
  );
}

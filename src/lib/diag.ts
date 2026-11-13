/**
 * Mensaje de un error apto para los logs: nunca incluye cadenas de conexión
 * (por si algún driver las mete en el mensaje).
 */
export function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/postgres(ql)?:\/\/\S+/gi, "[cadena de conexión oculta]");
}

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * El sitio público debe poder renderizarse aunque todavía no exista la base
 * de datos (por ejemplo, antes de crear el proyecto en Neon). Por eso la
 * conexión es perezosa y `isDatabaseConfigured` permite degradar con gracia
 * en vez de romper el build.
 */
export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

type Database = ReturnType<typeof createClient>;

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Copia .env.example a .env.local y añade la cadena de conexión de Neon.",
    );
  }
  return drizzle(neon(url), { schema });
}

let cached: Database | null = null;

/** Cliente Drizzle. Lanza error si DATABASE_URL no está configurada. */
export function getDb(): Database {
  if (!cached) cached = createClient();
  return cached;
}

/** Cliente Drizzle o `null` si aún no hay base de datos configurada. */
export function tryGetDb(): Database | null {
  if (!isDatabaseConfigured) return null;
  try {
    return getDb();
  } catch {
    return null;
  }
}

export { schema };

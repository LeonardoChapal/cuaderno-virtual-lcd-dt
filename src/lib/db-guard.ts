/**
 * Guarda de seguridad (CLAUDE.md §3.1): evita trabajar por error contra la
 * base de producción desde una máquina local.
 *
 * - Dentro de Vercel (existe `VERCEL_ENV`) no hace nada, para no poder tumbar
 *   producción ni los previews.
 * - Fuera de Vercel exige que el host de `DATABASE_URL` sea exactamente el de
 *   `DB_EXPECTED_HOST` (el host de la rama de Neon de desarrollo). Si falta
 *   cualquiera de las dos variables, o no coinciden, aborta.
 * - Solo imprime el host, nunca usuario ni contraseña.
 */

let alreadyChecked = false;

export function getDatabaseHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "(URL de base de datos inválida)";
  }
}

export function assertSafeDatabase(): void {
  if (process.env.VERCEL_ENV) return;
  if (alreadyChecked) return;

  const url = process.env.DATABASE_URL;
  if (!url) return; // sin base configurada no hay nada que proteger

  const host = getDatabaseHost(url);
  const expected = process.env.DB_EXPECTED_HOST?.trim();

  console.log(`[db-guard] Host de la base de datos: ${host}`);

  if (!expected) {
    throw new Error(
      "[db-guard] Falta DB_EXPECTED_HOST en .env.local. Define el host de tu rama de Neon de desarrollo para poder continuar.",
    );
  }
  if (host !== expected) {
    throw new Error(
      `[db-guard] El host (${host}) no coincide con DB_EXPECTED_HOST (${expected}). Abortando para no tocar otra base.`,
    );
  }
  alreadyChecked = true;
}

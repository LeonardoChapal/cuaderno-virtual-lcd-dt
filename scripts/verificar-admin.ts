import "../src/lib/load-env";

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { users } from "../src/db/schema";
import { assertSafeDatabase } from "../src/lib/db-guard";
import { verifyPassword } from "../src/lib/password";

/**
 * SOLO LECTURA. Comprueba que existe el usuario administrador, que su
 * contraseña está hasheada con bcrypt y si ADMIN_PASSWORD (de .env.local)
 * coincide con ese hash. Imprime solo true/false: nunca la contraseña ni el
 * hash.
 *
 *   npx tsx scripts/verificar-admin.ts
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL en .env.local.");
  assertSafeDatabase();

  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD;

  const db = drizzle(neon(url));
  const [record] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const existe = Boolean(record);
  const hashBcrypt = existe && /^\$2[aby]\$\d{2}\$.{53}$/.test(record.passwordHash);
  const passwordDefinida = Boolean(password);
  const coincide =
    existe && hashBcrypt && passwordDefinida
      ? await verifyPassword(password!, record.passwordHash)
      : false;

  console.log(`\nUsuario administrador existe:            ${existe}`);
  console.log(`Contraseña guardada con hash bcrypt:     ${hashBcrypt}`);
  console.log(`ADMIN_PASSWORD definida en .env.local:   ${passwordDefinida}`);
  console.log(`ADMIN_PASSWORD coincide con el hash:     ${coincide}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

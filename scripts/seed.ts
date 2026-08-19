import "../src/lib/load-env";

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { users } from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

/**
 * Crea (o actualiza) la única cuenta de administrador a partir de
 * ADMIN_USERNAME y ADMIN_PASSWORD. La contraseña nunca se guarda en claro:
 * se almacena su hash bcrypt.
 *
 *   npm run db:seed
 *
 * Volver a ejecutarlo después de cambiar ADMIN_PASSWORD actualiza la clave.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Copia .env.example a .env.local y pon la cadena de Neon.",
    );
  }

  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      "Falta ADMIN_PASSWORD. Defínela en .env.local antes de sembrar la base de datos.",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  }

  const db = drizzle(neon(url));
  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, existing.id));
    console.log(`Contraseña actualizada para el usuario "${username}".`);
  } else {
    await db.insert(users).values({
      username,
      passwordHash,
      name: "Leonardo Chapal Díaz",
    });
    console.log(`Administrador "${username}" creado correctamente.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

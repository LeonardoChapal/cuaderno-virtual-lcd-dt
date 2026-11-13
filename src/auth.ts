import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import { tryGetDb } from "./db";
import { users } from "./db/schema";
import { safeErrorMessage } from "./lib/diag";
import { verifyPassword } from "./lib/password";

/**
 * Una sola cuenta de administrador. No existe registro público: el usuario
 * se crea con `npm run db:seed` a partir de ADMIN_USERNAME/ADMIN_PASSWORD.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!username || !password) return null;

        // El administrador vive en Neon con la clave hasheada. Ya no hay
        // respaldo con ADMIN_PASSWORD en texto plano: sin base de datos, no
        // se puede entrar.
        const db = tryGetDb();
        if (!db) return null;

        let record: typeof users.$inferSelect | undefined;
        try {
          [record] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);
        } catch (error) {
          console.error(
            "[auth] La consulta del usuario falló:",
            safeErrorMessage(error),
          );
          return null;
        }

        if (!record) return null;
        if (!(await verifyPassword(password, record.passwordHash))) {
          return null;
        }

        return {
          id: record.id,
          name: record.name ?? record.username,
          username: record.username,
        };
      },
    }),
  ],
});

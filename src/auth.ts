import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import { tryGetDb } from "./db";
import { users } from "./db/schema";
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

        const db = tryGetDb();

        // Camino normal: el administrador vive en Neon con la clave hasheada.
        if (db) {
          const [record] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

          if (!record) return null;
          if (!(await verifyPassword(password, record.passwordHash))) {
            return null;
          }

          return {
            id: record.id,
            name: record.name ?? record.username,
            username: record.username,
          };
        }

        // Respaldo para desarrollo local antes de conectar la base de datos:
        // se comparan las credenciales contra las variables de entorno.
        const envUser = process.env.ADMIN_USERNAME;
        const envPassword = process.env.ADMIN_PASSWORD;
        if (!envUser || !envPassword) return null;
        if (username !== envUser || password !== envPassword) return null;

        return { id: "env-admin", name: envUser, username: envUser };
      },
    }),
  ],
});

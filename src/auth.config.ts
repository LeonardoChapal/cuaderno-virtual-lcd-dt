import type { NextAuthConfig } from "next-auth";

/**
 * Configuración compartida y "edge-safe": no importa la base de datos ni
 * bcrypt, por lo que puede ejecutarse en el middleware. El provider de
 * credenciales se añade sólo en `src/auth.ts` (runtime de Node.js).
 */
export const authConfig = {
  /**
   * Auth.js solo confia en el host automaticamente cuando detecta Vercel.
   * Activarlo explicitamente permite que funcione tambien en local con
   * `next start` y en cualquier otro alojamiento detras de un proxy.
   */
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    // 8 horas: suficiente para una jornada de trabajo en el panel.
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    /**
     * Guardia de rutas usada por el middleware.
     * - `/admin/**` exige sesión; si no hay, Auth.js redirige a `/login`.
     * - `/login` con sesión activa redirige al panel.
     */
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn;
      }

      if (pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

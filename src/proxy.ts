import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Guardia de rutas (antes `middleware.ts`, renombrado a `proxy.ts` en
 * Next.js 16). Protege `/admin/**`: sin sesión, Auth.js redirige a `/login`.
 * Usa la configuración edge-safe, sin base de datos ni bcrypt.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

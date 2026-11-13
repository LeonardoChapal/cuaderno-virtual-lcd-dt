import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/**
 * Se permite todo y no se lista ninguna ruta privada: nombrar `/login` o
 * `/admin` aquí las revelaría. Ya se protegen solas (el panel exige sesión y
 * ambas páginas llevan `noindex`).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

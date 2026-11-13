import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";
import { SECTIONS, getSubsections, planoHref, subsectionHref } from "@/lib/site";

/**
 * Solo páginas públicas. `/login` y `/admin` no aparecen: la ruta de acceso
 * es oculta por diseño (CLAUDE.md §7).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  const paths = [
    "/home",
    ...SECTIONS.flatMap((section) => [
      `/${section.slug}`,
      ...getSubsections(section).map((sub) => subsectionHref(section, sub.slug)),
      ...section.planos.map((plano) => planoHref(section, plano)),
    ]),
  ];

  return paths.map((path) => ({ url: `${base}${path}` }));
}

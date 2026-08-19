import Link from "next/link";

import type { SectionDef } from "@/lib/site";

type Crumb = { label: string; href?: string };

/**
 * Cabecera de página con la ruta de migas y el código de sección, en el mismo
 * registro que la casilla de identificación de una lámina.
 */
export default function PageHeader({
  section,
  crumbs = [],
  title,
  blurb,
  meta,
}: {
  section: SectionDef;
  crumbs?: Crumb[];
  title: string;
  blurb?: string;
  meta?: string;
}) {
  const trail: Crumb[] = [
    { label: "Índice", href: "/home" },
    { label: section.title, href: `/${section.slug}` },
    ...crumbs,
  ];

  return (
    <header className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
      <nav aria-label="Ruta de navegación" className="mb-7">
        <ol className="tag flex flex-wrap items-center gap-2 text-blueline">
          {trail.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden className="text-blueline/50">
                  /
                </span>
              ) : null}
              {crumb.href && index < trail.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-cyan"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-graphite">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-blueline/30 pb-6">
        <div>
          <p className="tag mb-3 text-amber">
            Sección {String(section.index).padStart(2, "0")} ·{" "}
            {section.tagline}
          </p>
          <h1 className="lettering text-[clamp(2rem,6vw,3.75rem)] text-chalk">
            {title}
          </h1>
          {blurb ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-graphite">
              {blurb}
            </p>
          ) : null}
        </div>
        {meta ? <p className="tag shrink-0 text-blueline">{meta}</p> : null}
      </div>
    </header>
  );
}

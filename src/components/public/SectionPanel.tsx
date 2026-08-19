import Link from "next/link";

import { type SectionDef, getSubsections, subsectionHref } from "@/lib/site";

/**
 * Panel de sección para el índice: se comporta como una lámina que "se
 * activa" al pasar el cursor — la retícula se aviva y el marco pasa a cian.
 */
export default function SectionPanel({ section }: { section: SectionDef }) {
  return (
    <article className="group relative border border-blueline/40 bg-prussian/90 transition-colors duration-300 hover:border-cyan/70">
      {/* Retícula interna que se aviva al activar el panel */}
      <span
        aria-hidden
        className="grid-iso pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Ticks de esquina */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex h-full flex-col p-6 sm:p-8">
        <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-blueline/30 pb-4">
          <span className="tag text-amber">
            Sección {String(section.index).padStart(2, "0")}
          </span>
          <span className="tag text-blueline">
            {section.planos.length} planos
          </span>
        </div>

        <h2 className="lettering mb-2 text-3xl text-chalk transition-colors duration-300 group-hover:text-cyan sm:text-4xl">
          <Link href={`/${section.slug}`} className="before:absolute before:inset-0">
            {section.title}
          </Link>
        </h2>

        <p className="tag mb-4 normal-case tracking-[0.12em] text-cyan/80">
          {section.tagline}
        </p>

        <p className="mb-7 text-sm leading-relaxed text-graphite">
          {section.description}
        </p>

        <ul className="mt-auto flex flex-col border-t border-blueline/30">
          {getSubsections(section).map((sub) => (
            <li key={sub.slug}>
              <Link
                href={subsectionHref(section, sub.slug)}
                className="relative z-10 flex items-center justify-between border-b border-blueline/20 py-3 text-sm text-graphite transition-colors last:border-b-0 hover:text-amber"
              >
                <span className="font-display uppercase tracking-[0.1em]">
                  {sub.title}
                </span>
                <span aria-hidden className="tag">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

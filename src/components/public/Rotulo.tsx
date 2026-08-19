import Link from "next/link";

import { SECTIONS, site } from "@/lib/site";

type Cell = { label: string; value: string };

/**
 * El rótulo (title block). Es la pieza estructural que identifica cualquier
 * plano técnico, así que aquí hace de pie de página con los campos que sí
 * informan algo en una web: institución, autor, curso y asignatura.
 */
export default function Rotulo() {
  const year = new Date().getFullYear();

  const cells: Cell[] = [
    { label: "Institución", value: site.school },
    { label: "Dibujó", value: site.author },
    { label: "Curso", value: site.course },
    { label: "Asignatura", value: site.subject },
  ];

  return (
    <footer className="relative mt-24 border-t border-blueline/40 bg-prussian/85">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="tag mb-2 text-blueline">Índice del cuaderno</p>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/home"
                className="font-display text-sm uppercase tracking-wider text-graphite transition-colors hover:text-cyan"
              >
                Inicio
              </Link>
              {SECTIONS.map((section) => (
                <Link
                  key={section.slug}
                  href={`/${section.slug}`}
                  className="font-display text-sm uppercase tracking-wider text-graphite transition-colors hover:text-cyan"
                >
                  {section.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex gap-4">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="tag text-graphite transition-colors hover:text-amber"
            >
              GitHub
            </a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="tag text-graphite transition-colors hover:text-amber"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Rótulo propiamente dicho */}
        <div className="grid grid-cols-2 border border-blueline/50 sm:grid-cols-4">
          {cells.map((cell) => (
            <div
              key={cell.label}
              className="border-b border-r border-blueline/30 px-4 py-3 last:border-r-0"
            >
              <p className="tag mb-1.5 text-blueline">{cell.label}</p>
              <p className="font-display text-sm uppercase tracking-wide text-chalk">
                {cell.value}
              </p>
            </div>
          ))}
        </div>

        <p className="tag mt-5 text-blueline">
          © {year} {site.author} — {site.location}
        </p>
      </div>
    </footer>
  );
}

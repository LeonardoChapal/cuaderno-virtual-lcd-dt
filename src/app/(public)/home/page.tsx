import type { Metadata } from "next";
import Link from "next/link";

import DimensionLine from "@/components/public/DimensionLine";
import HeroBlueprint from "@/components/public/HeroBlueprint";
import SectionPanel from "@/components/public/SectionPanel";
import { SECTIONS, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Índice",
  description: `Cuaderno virtual de ${site.subject} — planos, consultas y videos de apoyo. ${site.school}.`,
};

export default function HomePage() {
  const totalPlanos = SECTIONS.reduce(
    (total, section) => total + section.planos.length,
    0,
  );

  return (
    <>
      {/* ---------------------------------------------------------------
          Portada: el enunciado a la izquierda, el plano trazándose solo
          a la derecha.
         --------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <p className="tag mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-blueline">
              <span className="text-amber">{site.school}</span>
              <span aria-hidden>·</span>
              <span>{site.course}</span>
            </p>

            <h1 className="lettering mb-6 text-[clamp(2.75rem,9vw,5.5rem)] text-chalk">
              Dibujo
              <br />
              <span className="text-cyan">Técnico</span>
            </h1>

            <DimensionLine
              value={`${SECTIONS.length} secciones · ${totalPlanos} planos`}
              className="mb-7 max-w-md"
            />

            <p className="mb-9 max-w-md text-base leading-relaxed text-graphite">
              El cuaderno virtual de {site.author}. Reúne los planos, las
              consultas y los videos de apoyo de las dos secciones de la
              asignatura, cada lámina con su proceso.
            </p>

            <div className="flex flex-wrap gap-3">
              {SECTIONS.map((section, index) => (
                <Link
                  key={section.slug}
                  href={`/${section.slug}`}
                  className={`tag group relative overflow-hidden border px-6 py-4 transition-colors ${
                    index === 0
                      ? "border-amber text-amber hover:bg-amber hover:text-ferro"
                      : "border-blueline/60 text-chalk hover:border-cyan hover:text-cyan"
                  }`}
                >
                  {section.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative border border-blueline/30 bg-prussian/70 p-4 sm:p-7">
            <span className="tag absolute -top-2.5 left-5 bg-ferro px-2 text-blueline">
              Lámina de portada
            </span>
            <HeroBlueprint />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Las dos secciones
         --------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <header className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-blueline/30 pb-4">
          <h2 className="lettering text-2xl text-chalk">Contenido</h2>
          <p className="tag text-blueline">Elige una sección para empezar</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {SECTIONS.map((section) => (
            <SectionPanel key={section.slug} section={section} />
          ))}
        </div>
      </section>
    </>
  );
}

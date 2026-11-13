import Image from "next/image";
import Link from "next/link";

import { type PlanoItem, type SectionDef, planoHref } from "@/lib/site";

/**
 * Ficha técnica de un plano. La tarjeta imita una lámina: zona de dibujo con
 * retícula isométrica arriba y una banda de rótulo abajo con el código y la
 * escala. Al pasar el cursor se "activa": marco cian, ticks ámbar y una línea
 * de corte que barre la zona de dibujo.
 */
export default function PlanoCard({
  section,
  plano,
  count,
  cover,
}: {
  section: SectionDef;
  plano: PlanoItem;
  count: number;
  /** URL de la primera plancha del plano; sin ella se ve la retícula. */
  cover?: string;
}) {
  return (
    <article className="group relative flex flex-col border border-blueline/40 bg-prussian/90 transition-colors duration-300 hover:border-cyan/70">
      {/* Zona de dibujo */}
      <div className="grid-iso relative h-36 overflow-hidden border-b border-blueline/30">
        {cover ? (
          <>
            <Image
              src={cover}
              alt={`Vista previa de la plancha de ${plano.title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {/* Oscurece la base para que el código de lámina se lea */}
            <span
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-ferro/85 via-ferro/10 to-transparent"
            />
          </>
        ) : null}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-px bg-amber/70 opacity-0 transition-opacity duration-200 group-hover:animate-[sweep_1.2s_var(--ease-draft)] group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span
          className={`tag absolute bottom-3 left-4 transition-colors group-hover:text-cyan ${
            cover ? "text-chalk" : "text-label"
          }`}
        >
          {plano.code}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="lettering mb-2 text-xl text-chalk transition-colors group-hover:text-cyan">
          <Link
            href={planoHref(section, plano)}
            className="before:absolute before:inset-0"
          >
            {plano.title}
          </Link>
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-graphite">
          {plano.blurb}
        </p>

        {/* Banda de rótulo */}
        <dl className="mt-auto grid grid-cols-3 border-t border-blueline/30 pt-3">
          <div>
            <dt className="tag text-label">Escala</dt>
            <dd className="font-mono text-xs text-chalk">S/E</dd>
          </div>
          <div>
            <dt className="tag text-label">Lámina</dt>
            <dd className="font-mono text-xs text-chalk">{plano.code}</dd>
          </div>
          <div className="text-right">
            <dt className="tag text-label">Entradas</dt>
            <dd className="font-mono text-xs text-amber">
              {String(count).padStart(2, "0")}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

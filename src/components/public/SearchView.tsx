"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { type SearchItem, searchItems } from "@/lib/search";
import { SECTIONS, getSubsection } from "@/lib/site";

const TYPES = ["planos", "videos", "consultas"] as const;

const fieldClass =
  "w-full border border-blueline/50 bg-ferro px-4 py-3 text-base text-chalk outline-none transition-colors placeholder:text-graphite focus:border-cyan";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tag border px-4 py-3 transition-colors ${
        active
          ? "border-amber bg-amber text-ferro"
          : "border-blueline/50 text-graphite hover:border-cyan hover:text-cyan"
      }`}
    >
      {children}
    </button>
  );
}

function describeCounts({ images, videos, links }: SearchItem["counts"]) {
  const parts = [
    images ? `${images} ${images === 1 ? "foto" : "fotos"}` : null,
    videos ? `${videos} ${videos === 1 ? "video" : "videos"}` : null,
    links ? `${links} ${links === 1 ? "enlace" : "enlaces"}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/**
 * Buscador del cuaderno. Filtra en el navegador sobre las publicaciones ya
 * cargadas (son pocas), así que responde al instante y sin API. La búsqueda y
 * los filtros se reflejan en la URL (?q=…&seccion=…&tipo=…) para poder
 * compartir o volver a un resultado.
 */
export default function SearchView({ items }: { items: SearchItem[] }) {
  const params = useSearchParams();

  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [section, setSection] = useState(() => {
    const value = params.get("seccion") ?? "";
    return SECTIONS.some((item) => item.slug === value) ? value : "";
  });
  const [type, setType] = useState(() => {
    const value = params.get("tipo") ?? "";
    return (TYPES as readonly string[]).includes(value) ? value : "";
  });

  const results = useMemo(
    () => searchItems(items, { query, section, type }),
    [items, query, section, type],
  );

  /** Refleja el estado en la URL sin recargar ni añadir entradas al historial. */
  function syncUrl(next: { query: string; section: string; type: string }) {
    const url = new URL(window.location.href);
    const set = (key: string, value: string) =>
      value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
    set("q", next.query.trim());
    set("seccion", next.section);
    set("tipo", next.type);
    window.history.replaceState(null, "", url);
  }

  function update(patch: Partial<{ query: string; section: string; type: string }>) {
    const next = { query, section, type, ...patch };
    setQuery(next.query);
    setSection(next.section);
    setType(next.type);
    syncUrl(next);
  }

  const filtering = Boolean(query.trim() || section || type);

  return (
    <div>
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="mb-8 flex flex-col gap-5 border border-blueline/40 bg-prussian/90 p-5 sm:p-6"
      >
        <div>
          <label htmlFor="buscar" className="tag mb-2 block text-label">
            Buscar en el cuaderno
          </label>
          <input
            id="buscar"
            type="search"
            value={query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Tornillo, perspectiva, calderería…"
            autoComplete="off"
            className={fieldClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="tag mb-2 text-label">Sección</legend>
            <div className="flex flex-wrap gap-2">
              <Chip active={!section} onClick={() => update({ section: "" })}>
                Todas
              </Chip>
              {SECTIONS.map((item) => (
                <Chip
                  key={item.slug}
                  active={section === item.slug}
                  onClick={() => update({ section: item.slug })}
                >
                  {item.title}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="tag mb-2 text-label">Tipo</legend>
            <div className="flex flex-wrap gap-2">
              <Chip active={!type} onClick={() => update({ type: "" })}>
                Todos
              </Chip>
              {TYPES.map((key) => (
                <Chip
                  key={key}
                  active={type === key}
                  onClick={() => update({ type: key })}
                >
                  {getSubsection(key).title}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>
      </form>

      <p role="status" aria-live="polite" className="tag mb-5 text-label">
        {results.length === 1
          ? "1 resultado"
          : `${results.length} resultados`}
        {filtering ? "" : ` · ${items.length === 1 ? "publicación" : "publicaciones"} del cuaderno`}
      </p>

      {results.length === 0 ? (
        <div className="border border-dashed border-blueline/40 px-6 py-14 text-center">
          <p className="lettering mb-2 text-lg text-graphite">
            {items.length === 0 ? "Aún no hay publicaciones" : "Sin resultados"}
          </p>
          {items.length > 0 ? (
            <>
              <p className="mb-5 text-sm text-graphite">
                Prueba con otra palabra o quita algún filtro.
              </p>
              <button
                type="button"
                onClick={() => update({ query: "", section: "", type: "" })}
                className="tag border border-blueline/50 px-5 py-3 text-chalk transition-colors hover:border-cyan hover:text-cyan"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {results.map((item) => {
            const counts = describeCounts(item.counts);
            return (
              <li key={item.id}>
                <article className="group relative flex h-full gap-4 border border-blueline/40 bg-prussian/90 p-4 transition-colors duration-300 hover:border-cyan/70">
                  {item.cover ? (
                    <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden border border-blueline/30 min-[420px]:block">
                      <Image
                        src={item.cover}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <p className="tag mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-label">
                      <span className="text-amber">{item.sectionTitle}</span>
                      <span aria-hidden>/</span>
                      <span>{item.planoTitle ?? item.subsectionTitle}</span>
                    </p>

                    <h2 className="lettering mb-1.5 text-lg text-chalk transition-colors group-hover:text-cyan">
                      <Link href={item.href} className="before:absolute before:inset-0">
                        {item.title}
                      </Link>
                    </h2>

                    {item.snippet ? (
                      <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-graphite">
                        {item.snippet}
                      </p>
                    ) : null}

                    <p className="tag text-label">
                      {item.date}
                      {counts ? ` · ${counts}` : ""}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SECTIONS, getSubsections, site, subsectionHref } from "@/lib/site";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-colors duration-300 ${
        scrolled
          ? "border-blueline/40 bg-ferro/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/home" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-blueline/60 font-display text-xs font-700 tracking-tight text-cyan transition-colors group-hover:border-cyan">
            {site.shortName}
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base uppercase tracking-[0.14em] text-chalk">
              {site.name}
            </span>
            <span className="tag block text-blueline">{site.school}</span>
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-stretch lg:flex">
          {SECTIONS.map((section) => {
            const active = pathname.startsWith(`/${section.slug}`);
            return (
              <div key={section.slug} className="group relative">
                <Link
                  href={`/${section.slug}`}
                  className={`flex h-full items-center gap-2.5 border-l border-blueline/25 px-5 py-2 transition-colors ${
                    active ? "text-cyan" : "text-graphite hover:text-chalk"
                  }`}
                >
                  <span className="tag text-blueline">
                    {String(section.index).padStart(2, "0")}
                  </span>
                  <span className="font-display text-sm uppercase tracking-[0.1em]">
                    {section.title}
                  </span>
                </Link>

                {/* Submenú: las tres subsecciones de la sección */}
                <div className="invisible absolute right-0 top-full w-64 translate-y-1 border border-blueline/50 bg-prussian opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {getSubsections(section).map((sub) => (
                    <Link
                      key={sub.slug}
                      href={subsectionHref(section, sub.slug)}
                      className="block border-b border-blueline/25 px-4 py-3 last:border-b-0 transition-colors hover:bg-prussian-2"
                    >
                      <span className="block font-display text-sm uppercase tracking-wide text-chalk">
                        {sub.title}
                      </span>
                      <span className="tag mt-1 block normal-case tracking-normal text-graphite">
                        {sub.blurb}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Botón de menú móvil */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-blueline/50 transition-colors hover:border-cyan lg:hidden"
        >
          <span
            className={`h-px w-5 bg-chalk transition-transform duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-5 bg-chalk transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-px w-5 bg-chalk transition-transform duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Panel móvil */}
      <div
        className={`overflow-hidden border-blueline/40 bg-ferro/95 backdrop-blur-md transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? "max-h-[32rem] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
          {SECTIONS.map((section) => (
            <div key={section.slug} className="border-b border-blueline/25 py-4 last:border-b-0">
              <Link
                href={`/${section.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-2.5 text-chalk"
              >
                <span className="tag text-blueline">
                  {String(section.index).padStart(2, "0")}
                </span>
                <span className="font-display text-lg uppercase tracking-[0.08em]">
                  {section.title}
                </span>
              </Link>
              <div className="mt-3 flex flex-col gap-2 pl-8">
                {getSubsections(section).map((sub) => (
                  <Link
                    key={sub.slug}
                    href={subsectionHref(section, sub.slug)}
                    onClick={() => setOpen(false)}
                    className="text-sm text-graphite transition-colors hover:text-cyan"
                  >
                    {sub.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "@/components/public/PageHeader";
import { SECTIONS, getSection, getSubsections, subsectionHref } from "@/lib/site";

type Params = { section: string };

export function generateStaticParams(): Params[] {
  return SECTIONS.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const section = getSection((await params).section);
  if (!section) return {};
  return { title: section.title, description: section.description };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const section = getSection((await params).section);
  if (!section) notFound();

  const subsections = getSubsections(section);

  return (
    <>
      <PageHeader
        section={section}
        title={section.title}
        blurb={section.description}
        meta={`${section.planos.length} planos`}
      />

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {subsections.map((sub, index) => (
            <Link
              key={sub.slug}
              href={subsectionHref(section, sub.slug)}
              className="group relative flex flex-col border border-blueline/40 bg-prussian/90 p-6 transition-colors duration-300 hover:border-cyan/70"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <span className="tag mb-5 text-blueline">
                {String(section.index).padStart(2, "0")}.
                {String(index + 1).padStart(2, "0")}
              </span>

              <h2 className="lettering mb-2 text-2xl text-chalk transition-colors group-hover:text-cyan">
                {sub.title}
              </h2>

              <p className="mb-8 text-sm leading-relaxed text-graphite">
                {sub.blurb}
              </p>

              <span
                aria-hidden
                className="tag mt-auto text-amber transition-transform duration-300 group-hover:translate-x-1"
              >
                Abrir →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

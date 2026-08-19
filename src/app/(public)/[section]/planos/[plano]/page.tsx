import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import EmptyState from "@/components/public/EmptyState";
import PageHeader from "@/components/public/PageHeader";
import PostCard from "@/components/public/PostCard";
import { listPosts } from "@/lib/posts";
import {
  SECTIONS,
  getPlano,
  getSection,
  getSubsection,
  planoHref,
} from "@/lib/site";

// Red de seguridad: aunque las acciones del panel llaman a revalidatePath,
// la pagina tambien se regenera sola cada 10 minutos.
export const revalidate = 600;

type Params = { section: string; plano: string };

export function generateStaticParams(): Params[] {
  return SECTIONS.flatMap((section) =>
    section.planos.map((plano) => ({
      section: section.slug,
      plano: plano.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { section: sectionSlug, plano: planoSlug } = await params;
  const section = getSection(sectionSlug);
  const plano = section && getPlano(section, planoSlug);
  if (!section || !plano) return {};

  return {
    title: `${plano.title} · ${section.title}`,
    description: plano.blurb,
  };
}

export default async function PlanoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { section: sectionSlug, plano: planoSlug } = await params;
  const section = getSection(sectionSlug);
  if (!section) notFound();

  const plano = getPlano(section, planoSlug);
  if (!plano) notFound();

  const posts = await listPosts({
    section: section.value,
    subsection: "planos",
    planoSlug: plano.slug,
  });

  const siblings = section.planos.filter((item) => item.slug !== plano.slug);

  return (
    <>
      <PageHeader
        section={section}
        crumbs={[
          {
            label: getSubsection("planos").title,
            href: `/${section.slug}/planos`,
          },
          { label: plano.title },
        ]}
        title={plano.title}
        blurb={plano.blurb}
        meta={plano.code}
      />

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        {posts.length === 0 ? (
          <EmptyState
            title="Lámina en blanco"
            hint={`Todavía no se ha publicado nada en ${plano.title}. El contenido se agrega desde el panel del cuaderno.`}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                code={`${plano.code}.${String(index + 1).padStart(2, "0")}`}
              />
            ))}
          </div>
        )}

        {/* Resto de láminas de la misma sección */}
        <nav className="mt-16 border-t border-blueline/30 pt-6">
          <p className="tag mb-4 text-blueline">
            Otras láminas de {section.title}
          </p>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((item) => (
              <li key={item.slug}>
                <Link
                  href={planoHref(section, item)}
                  className="tag inline-flex items-center gap-2 border border-blueline/40 px-4 py-2.5 text-graphite transition-colors hover:border-amber hover:text-amber"
                >
                  <span className="text-blueline">{item.code}</span>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

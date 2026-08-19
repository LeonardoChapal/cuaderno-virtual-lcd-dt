import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PlanosIndex from "@/components/public/PlanosIndex";
import { SECTIONS, getSection, getSubsection } from "@/lib/site";

// Red de seguridad: aunque las acciones del panel llaman a revalidatePath,
// la pagina tambien se regenera sola cada 10 minutos.
export const revalidate = 600;

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
  return {
    title: `${getSubsection("planos").title} · ${section.title}`,
    description: `Láminas y proyectos de ${section.title}.`,
  };
}

/**
 * Ruta independiente para cada sección, pero la vista es siempre el mismo
 * componente compartido `PlanosIndex`.
 */
export default async function PlanosPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const section = getSection((await params).section);
  if (!section) notFound();

  return <PlanosIndex section={section} />;
}

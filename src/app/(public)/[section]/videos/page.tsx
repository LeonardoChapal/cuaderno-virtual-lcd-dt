import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SubsectionView from "@/components/public/SubsectionView";
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
    title: `${getSubsection("videos").title} · ${section.title}`,
    description: getSubsection("videos").blurb,
  };
}

export default async function VideosPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const section = getSection((await params).section);
  if (!section) notFound();

  return <SubsectionView section={section} subsection="videos" />;
}

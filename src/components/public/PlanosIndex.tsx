import PageHeader from "@/components/public/PageHeader";
import PlanoCard from "@/components/public/PlanoCard";
import { listPosts } from "@/lib/posts";
import { type SectionDef, getSubsection } from "@/lib/site";

/**
 * Vista compartida por los dos "Planos" del sitio.
 *
 * `/diseno-aplicado/planos` y `/fundamentacion-tecnologica/planos` son rutas
 * independientes, pero ambas renderizan este mismo componente: mismo diseño,
 * distinta lista de datos (la de `section.planos`).
 */
export default async function PlanosIndex({
  section,
}: {
  section: SectionDef;
}) {
  const sub = getSubsection("planos");

  // Cuántas publicaciones hay en cada plano, para mostrarlo en la ficha.
  const posts = await listPosts({
    section: section.value,
    subsection: "planos",
  });

  const counts = posts.reduce<Record<string, number>>((acc, post) => {
    if (post.planoSlug) acc[post.planoSlug] = (acc[post.planoSlug] ?? 0) + 1;
    return acc;
  }, {});

  // Portada de cada tarjeta: la primera imagen del primer post (ya vienen
  // ordenados por `position`) de ese plano. Sin imagen, la tarjeta conserva
  // la retícula isométrica.
  const covers: Record<string, string> = {};
  for (const post of posts) {
    if (!post.planoSlug || covers[post.planoSlug]) continue;
    const image = post.media.find((item) => item.type === "image");
    if (image) covers[post.planoSlug] = image.url;
  }

  return (
    <>
      <PageHeader
        section={section}
        crumbs={[{ label: sub.title }]}
        title={sub.title}
        blurb={sub.blurb}
        meta={`${section.planos.length} láminas`}
      />

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.planos.map((plano) => (
            <PlanoCard
              key={plano.slug}
              section={section}
              plano={plano}
              count={counts[plano.slug] ?? 0}
              cover={covers[plano.slug]}
            />
          ))}
        </div>
      </div>
    </>
  );
}

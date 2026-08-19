import EmptyState from "@/components/public/EmptyState";
import PageHeader from "@/components/public/PageHeader";
import PostCard from "@/components/public/PostCard";
import { listPosts } from "@/lib/posts";
import {
  type SectionDef,
  type SubsectionKey,
  getSubsection,
} from "@/lib/site";

/**
 * Vista compartida por "Videos de apoyo" y "Consultas" en ambas secciones:
 * lista las publicaciones creadas desde el panel para esa sección.
 */
export default async function SubsectionView({
  section,
  subsection,
}: {
  section: SectionDef;
  subsection: Exclude<SubsectionKey, "planos">;
}) {
  const sub = getSubsection(subsection);
  const posts = await listPosts({
    section: section.value,
    subsection: sub.value,
  });

  const prefix = subsection === "videos" ? "VID" : "CON";

  return (
    <>
      <PageHeader
        section={section}
        crumbs={[{ label: sub.title }]}
        title={sub.title}
        blurb={sub.blurb}
        meta={`${String(posts.length).padStart(2, "0")} publicaciones`}
      />

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        {posts.length === 0 ? (
          <EmptyState
            title={`Aún no hay ${sub.title.toLowerCase()}`}
            hint="Las publicaciones de esta sección aparecerán aquí en cuanto se agreguen desde el panel del cuaderno."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                code={`${prefix}-${String(index + 1).padStart(2, "0")}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

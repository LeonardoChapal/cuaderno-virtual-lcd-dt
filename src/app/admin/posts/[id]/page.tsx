import { notFound } from "next/navigation";

import PostForm from "@/components/admin/PostForm";
import { getPostById } from "@/lib/posts";

import { updatePost } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  // Se fija el id de la publicación en la acción del servidor.
  const action = updatePost.bind(null, post.id);

  return (
    <>
      <header className="mb-8 border-b border-blueline/30 pb-5">
        <h1 className="font-display text-3xl uppercase tracking-[0.08em] text-chalk">
          Editar publicación
        </h1>
        <p className="mt-1 truncate text-sm text-graphite">{post.title}</p>
      </header>

      <PostForm action={action} post={post} submitLabel="Guardar cambios" />
    </>
  );
}

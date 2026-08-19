import PostForm from "@/components/admin/PostForm";

import { createPost } from "../../actions";

export default function NewPostPage() {
  return (
    <>
      <header className="mb-8 border-b border-blueline/30 pb-5">
        <h1 className="font-display text-3xl uppercase tracking-[0.08em] text-chalk">
          Nueva publicación
        </h1>
        <p className="mt-1 text-sm text-graphite">
          Elige dónde aparece y adjunta el material.
        </p>
      </header>

      <PostForm action={createPost} submitLabel="Publicar" />
    </>
  );
}

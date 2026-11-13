"use client";

import { useFormStatus } from "react-dom";

import { deletePost } from "@/app/admin/actions";

function Button() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tag border border-blueline/50 px-4 py-2.5 text-graphite transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}

/**
 * Eliminar borra el post real y sus adjuntos de la base, así que se pide
 * confirmación antes de enviar el formulario.
 */
export default function DeletePostButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deletePost}
      onSubmit={(event) => {
        const ok = window.confirm(
          `¿Eliminar "${title}"?\n\nSe borrará la publicación y su lista de adjuntos. Esta acción no se puede deshacer.`,
        );
        if (!ok) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button />
    </form>
  );
}

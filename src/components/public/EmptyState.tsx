/**
 * Estado vacío: una hoja sin trazar. Dice qué falta y quién lo llena, en vez
 * de disculparse.
 */
export default function EmptyState({
  title = "Todavía no hay nada trazado aquí",
  hint = "El contenido de esta sección se publica desde el panel del cuaderno.",
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="grid-iso border border-dashed border-blueline/40 px-6 py-16 text-center">
      <p className="lettering mb-3 text-xl text-graphite">{title}</p>
      <p className="mx-auto max-w-sm text-sm text-graphite/70">{hint}</p>
    </div>
  );
}

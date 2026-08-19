/**
 * Marco de lámina: ticks en las cuatro esquinas y marcas de centrado en los
 * puntos medios de cada borde — las mismas referencias que lleva una hoja de
 * dibujo normalizada para plegarla y centrarla. Es puramente decorativo y
 * queda fijo sobre el viewport.
 */
export default function SheetFrame() {
  const corner = "absolute h-6 w-6 border-blueline/50";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-3 z-40 sm:inset-5"
    >
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />

      {/* Marcas de centrado */}
      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-blueline/40" />
      <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-blueline/40" />
      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-blueline/40" />
      <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-blueline/40" />
    </div>
  );
}

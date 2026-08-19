type DimensionLineProps = {
  /** Texto de la cota: lo que se está "midiendo". */
  value: string;
  className?: string;
};

/**
 * Línea de cota con sus flechas y el valor centrado, igual que en un plano.
 * Se usa con cuentagotas: sólo donde realmente aporta una medida al contenido.
 */
export default function DimensionLine({
  value,
  className = "",
}: DimensionLineProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="relative h-px flex-1 bg-amber/60">
        <span className="absolute left-0 top-1/2 h-2 w-px -translate-y-1/2 bg-amber/60" />
        <span className="absolute left-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[3px] border-r-[6px] border-y-transparent border-r-amber/60" />
      </span>
      <span className="tag whitespace-nowrap text-amber">{value}</span>
      <span className="relative h-px flex-1 bg-amber/60">
        <span className="absolute right-0 top-1/2 h-2 w-px -translate-y-1/2 bg-amber/60" />
        <span className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[3px] border-l-[6px] border-y-transparent border-l-amber/60" />
      </span>
    </div>
  );
}

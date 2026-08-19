"use client";

import { usePathname } from "next/navigation";

/**
 * Transición ligera entre páginas: al cambiar la ruta el contenido se vuelve a
 * montar y entra con un desvanecido corto. Deliberadamente discreto — la
 * animación fuerte del sitio es el trazado del plano en /home.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-rise">
      {children}
    </div>
  );
}

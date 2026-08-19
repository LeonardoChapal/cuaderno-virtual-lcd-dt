import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid-paper flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="tag text-amber">Error 404 — lámina no encontrada</p>
      <h1 className="lettering text-5xl text-chalk sm:text-7xl">
        Esta hoja está en blanco
      </h1>
      <p className="max-w-md text-graphite">
        La ruta que buscas no existe en el cuaderno. Vuelve al índice para
        seguir consultando los planos.
      </p>
      <Link
        href="/home"
        className="tag border border-amber px-6 py-3 text-amber transition-colors hover:bg-amber hover:text-ferro"
      >
        Volver al índice
      </Link>
    </main>
  );
}

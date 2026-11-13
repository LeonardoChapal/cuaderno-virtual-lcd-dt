import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import SearchView from "@/components/public/SearchView";
import { listPublishedPosts } from "@/lib/posts";
import { buildSearchItems } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";

// Red de seguridad: el panel llama a revalidatePath("/buscar") al guardar,
// y además la página se regenera sola cada 10 minutos.
export const revalidate = 600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Buscar",
    description:
      "Busca planchas, videos de apoyo y consultas en el cuaderno virtual.",
    path: "/buscar",
  }),
  // Es una herramienta, no contenido: no tiene sentido en los buscadores.
  robots: { index: false, follow: true },
};

export default async function BuscarPage() {
  const items = buildSearchItems(await listPublishedPosts());

  return (
    <>
      <header className="mx-auto max-w-6xl px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
        <nav aria-label="Ruta de navegación" className="mb-7">
          <ol className="tag flex flex-wrap items-center gap-2 text-label">
            <li>
              <Link href="/home" className="transition-colors hover:text-cyan">
                Índice
              </Link>
            </li>
            <li aria-hidden className="text-blueline/50">
              /
            </li>
            <li className="text-graphite">Buscar</li>
          </ol>
        </nav>

        <div className="border-b border-blueline/30 pb-6">
          <h1 className="lettering text-[clamp(2rem,6vw,3.75rem)] text-chalk">
            Buscar
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-graphite">
            Encuentra planchas, videos de apoyo y consultas de las dos secciones
            por título, tema o contenido.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        {/* useSearchParams exige un límite de Suspense en páginas estáticas. */}
        <Suspense
          fallback={<p className="tag text-label">Cargando el buscador…</p>}
        >
          <SearchView items={items} />
        </Suspense>
      </div>
    </>
  );
}

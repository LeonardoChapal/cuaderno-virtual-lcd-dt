import type { Metadata } from "next";

import { site } from "@/lib/site";

import LoginForm from "./LoginForm";

/**
 * Página oculta: no está enlazada desde ninguna navegación pública y se
 * excluye de los buscadores. Sólo la usa el administrador del cuaderno.
 */
export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false, nocache: true },
};

export default function LoginPage() {
  return (
    <main className="grid-paper flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        {/* Ticks de encuadre */}
        <div className="relative border border-blueline/50 bg-prussian/60 p-7 sm:p-9">
          <span
            aria-hidden
            className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-amber"
          />
          <span
            aria-hidden
            className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-amber"
          />

          <p className="tag mb-2 text-amber">Acceso restringido</p>
          <h1 className="lettering mb-1 text-3xl text-chalk">{site.name}</h1>
          <p className="mb-8 text-sm text-graphite">
            Panel de administración del cuaderno.
          </p>

          <LoginForm />
        </div>

        <p className="tag mt-5 text-center text-blueline/70">
          {site.school} · {site.author}
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { site } from "@/lib/site";

import { logout } from "./logout";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Segunda barrera, además del proxy: si no hay sesión, a /login.
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col bg-ferro">
      <header className="border-b border-blueline/40 bg-prussian/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-baseline gap-4">
            <Link
              href="/admin"
              className="font-display text-lg uppercase tracking-[0.12em] text-chalk"
            >
              Panel
            </Link>
            <span className="tag text-blueline">{site.name}</span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/home"
              className="tag text-graphite transition-colors hover:text-cyan"
            >
              Ver el sitio
            </Link>
            <span className="tag text-blueline">
              {session.user.username ?? session.user.name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="tag border border-blueline/50 px-3 py-2 text-graphite transition-colors hover:border-amber hover:text-amber"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}

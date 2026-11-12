import "../src/lib/load-env";

import { neon } from "@neondatabase/serverless";
import { count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { postMedia, posts } from "../src/db/schema";
import { assertSafeDatabase } from "../src/lib/db-guard";

/**
 * Conteo de SOLO LECTURA (CLAUDE.md §14). Solo ejecuta SELECT y peticiones
 * HEAD a las URLs de archivos; no escribe en la base ni descarga archivos.
 *
 *   npm run db:count
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL en .env.local.");
  assertSafeDatabase();

  const db = drizzle(neon(url));

  const [{ total }] = await db.select({ total: count() }).from(posts);
  console.log(`\nTotal de posts: ${total}`);

  const porGrupo = await db
    .select({
      section: posts.section,
      subsection: posts.subsection,
      planoSlug: sql<string>`coalesce(${posts.planoSlug}, '-')`,
      total: count(),
      publicados: sql<number>`count(*) filter (where ${posts.published})`,
    })
    .from(posts)
    .groupBy(posts.section, posts.subsection, posts.planoSlug)
    .orderBy(posts.section, posts.subsection, posts.planoSlug);

  console.log("\nPosts por sección / subcategoría / plano (total, publicados):");
  for (const r of porGrupo) {
    console.log(
      `  ${r.section} / ${r.subsection} / ${r.planoSlug}: ${r.total} (${r.publicados})`,
    );
  }

  const medios = await db
    .select({ type: postMedia.type, url: postMedia.url })
    .from(postMedia);
  console.log(`\nTotal de medios (post_media): ${medios.length}`);

  const porTipo = new Map<string, number>();
  for (const m of medios) porTipo.set(m.type, (porTipo.get(m.type) ?? 0) + 1);
  for (const [t, n] of porTipo) console.log(`  ${t}: ${n}`);

  // HEAD solo a archivos (no a páginas externas ni YouTube).
  const archivos = medios.filter(
    (m) => m.type === "image" || m.type === "video_upload",
  );
  let ok = 0;
  const fallos: string[] = [];
  for (const m of archivos) {
    try {
      const res = await fetch(m.url, { method: "HEAD" });
      if (res.ok) ok++;
      else fallos.push(`${res.status} ${new URL(m.url).host}`);
    } catch {
      fallos.push(`error de red ${new URL(m.url).host}`);
    }
  }
  console.log(
    `\nArchivos en Blob referenciados: ${archivos.length}, responden bien: ${ok}`,
  );
  if (fallos.length) console.log("Fallos:", fallos.join("; "));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

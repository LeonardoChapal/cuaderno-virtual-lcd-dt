import "../src/lib/load-env";

import { neon } from "@neondatabase/serverless";

import { assertSafeDatabase } from "../src/lib/db-guard";

/**
 * SOLO LECTURA. Consulta el catálogo de Postgres para saber:
 *  - si existe la tabla de migraciones de Drizzle y qué hay registrado;
 *  - qué columnas tienen realmente las tablas del esquema.
 * No escribe nada. Sirve para decidir cómo dejar la base lista para
 * `drizzle-kit migrate` (producción se creó con `db:push`).
 *
 *   npx tsx scripts/verificar-migraciones.ts
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL en .env.local.");
  assertSafeDatabase();

  const sql = neon(url);

  const tablas = await sql`
    select table_schema, table_name
    from information_schema.tables
    where table_name = '__drizzle_migrations'
  `;
  console.log("\nTabla de migraciones de Drizzle:");
  if (tablas.length === 0) {
    console.log("  NO existe (la base se creó sin migraciones, p. ej. con push).");
  } else {
    for (const t of tablas) {
      console.log(`  existe en el esquema "${t.table_schema}"`);
      const filas = await sql.query(
        `select id, hash, created_at from "${t.table_schema}"."__drizzle_migrations" order by id`,
      );
      console.log(`  filas registradas: ${filas.length}`);
      for (const f of filas) console.log(`   - id ${f.id}, created_at ${f.created_at}`);
    }
  }

  const columnas = await sql`
    select table_name, column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public' and table_name in ('users','posts','post_media')
    order by table_name, ordinal_position
  `;
  console.log("\nColumnas reales (public):");
  for (const c of columnas) {
    console.log(
      `  ${c.table_name}.${c.column_name}: ${c.data_type}, null=${c.is_nullable}, default=${c.column_default ?? "-"}`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

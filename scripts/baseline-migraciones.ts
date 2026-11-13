import "../src/lib/load-env";

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { neon } from "@neondatabase/serverless";

import { assertSafeDatabase } from "../src/lib/db-guard";

/**
 * Baseline de migraciones (ver docs/HALLAZGOS.md). La base se creó con
 * `db:push`, así que no tiene la tabla de control de Drizzle. Este script la
 * crea y registra `0000` como ya aplicada, para que `db:migrate` solo ejecute
 * migraciones nuevas.
 *
 * Es ADITIVO: no toca users, posts ni post_media. Es idempotente: si ya hay
 * filas registradas, no inserta nada.
 *
 *   npx tsx scripts/baseline-migraciones.ts
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL en .env.local.");
  assertSafeDatabase();

  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  const entry = journal.entries[0];
  if (!entry || entry.tag !== "0000_wet_sentinels") {
    throw new Error("El journal no tiene 0000_wet_sentinels como primera entrada.");
  }
  const sqlText = readFileSync(`drizzle/${entry.tag}.sql`, "utf8");
  const hash = createHash("sha256").update(sqlText).digest("hex");

  const sql = neon(url);

  await sql.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
  await sql.query(
    `CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`,
  );

  const existing = await sql.query(
    `SELECT count(*)::int AS n FROM "drizzle"."__drizzle_migrations"`,
  );
  if (existing[0].n > 0) {
    console.log(`Ya hay ${existing[0].n} migración(es) registrada(s). No se inserta nada.`);
    return;
  }

  await sql.query(
    `INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES ($1, $2)`,
    [hash, entry.when],
  );
  console.log(`Baseline registrado: ${entry.tag} (hash ${hash.slice(0, 12)}…, when ${entry.when}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

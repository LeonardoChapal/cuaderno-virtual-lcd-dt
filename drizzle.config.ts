import "./src/lib/load-env";
import { defineConfig } from "drizzle-kit";

import { assertSafeDatabase } from "./src/lib/db-guard";

assertSafeDatabase();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

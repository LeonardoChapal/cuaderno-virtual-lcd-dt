import { config } from "dotenv";

/**
 * Carga las variables de entorno para los scripts de línea de comandos
 * (drizzle-kit y el seed). Next.js ya lee `.env.local` por su cuenta, pero
 * `dotenv/config` solo miraría `.env`, así que aquí se declaran los dos
 * archivos en el mismo orden de prioridad que usa Next.js.
 */
config({ path: [".env.local", ".env"] });

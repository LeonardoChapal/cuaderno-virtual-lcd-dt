import type { Metadata, Viewport } from "next";
import { Archivo_Narrow, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { site } from "@/lib/site";

import "./globals.css";

/** Lettering de lámina: condensada, monolineal, de linaje DIN. */
const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Texto corrido: Plex fue diseñada para contextos técnicos y de ingeniería. */
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/** Datos técnicos: códigos de lámina, cotas, escalas, fechas. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} · ${site.subject}`,
    template: `%s · ${site.name}`,
  },
  description: `Planos, consultas y videos de apoyo de ${site.subject}. ${site.school} — ${site.author}, ${site.course}.`,
  authors: [{ name: site.author }],
  openGraph: {
    title: `${site.name} · ${site.subject}`,
    description: `Cuaderno virtual de ${site.subject} — ${site.school}.`,
    locale: "es_CO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#06121f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${archivoNarrow.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

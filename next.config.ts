import type { NextConfig } from "next";

/**
 * Vercel (full-stack). Ya NO se usa `output: "export"` ni `basePath`,
 * porque el sitio necesita rutas de servidor (auth, API, base de datos).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  // Nadie debe incrustar el sitio en un iframe (el sitio sí incrusta YouTube).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // AVIF pesa bastante menos que WebP en planchas con líneas finas; si el
    // navegador no lo soporta, Next cae a WebP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Vercel Blob (fotos y portadas subidas desde el panel)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Miniaturas de YouTube
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;

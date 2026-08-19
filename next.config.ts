import type { NextConfig } from "next";

/**
 * Vercel (full-stack). Ya NO se usa `output: "export"` ni `basePath`,
 * porque el sitio necesita rutas de servidor (auth, API, base de datos).
 */
const nextConfig: NextConfig = {
  images: {
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

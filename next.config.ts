import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/cuaderno-virtual-lcd-dt",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
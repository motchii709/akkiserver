import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/akkiserver",
  assetPrefix: "/akkiserver/",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

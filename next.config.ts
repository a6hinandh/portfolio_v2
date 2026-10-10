import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build the whole site as plain HTML into /out, so it can be served by any
  // static host. Pages are generated at build time; redeploy to refresh them.
  output: "export",
  // Emit /about/index.html rather than /about.html, so static hosts serve
  // /about without needing rewrite rules.
  trailingSlash: true,
  // There is no server to resize images, so they are served as-is.
  images: { unoptimized: true },
};

export default nextConfig;

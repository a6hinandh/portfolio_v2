import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  const site = getProfile();
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(site.url ? { sitemap: `${site.url}/sitemap.xml` } : {}),
  };
}

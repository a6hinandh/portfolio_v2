import type { MetadataRoute } from "next";
import { getProfile, getWrittenProjects } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const { url } = getProfile();
  const pages = ["", "/work", "/about", "/resume"].map((p) => ({ url: `${url}${p}`, lastModified: new Date() }));
  const projects = getWrittenProjects().map((p) => ({ url: `${url}/work/${p.slug}`, lastModified: new Date() }));
  return [...pages, ...projects];
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/_next/"] }], sitemap: absoluteUrl("/sitemap.xml"), host: "https://uretir.com" };
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/uretir-id", "/yonetici", "/puan-ai/admin"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: "https://uretir.com",
  };
}

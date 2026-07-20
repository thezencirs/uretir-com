import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return { name: SITE_NAME, short_name: SITE_NAME, description: DEFAULT_DESCRIPTION, start_url: "/", display: "standalone", background_color: "#f7f7f3", theme_color: "#c8f560", lang: "tr", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}

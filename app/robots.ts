import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/apply", "/portal"] },
    sitemap: "https://www.nhcafoundation.org/sitemap.xml",
  };
}

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.nhcafoundation.org", changeFrequency: "monthly", priority: 1 },
    { url: "https://www.nhcafoundation.org/donate", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://www.nhcafoundation.org/apply", changeFrequency: "monthly", priority: 0.8 },
  ];
}

import { MetadataRoute } from "next";
import locations from "@/data/locations.json";
import { SITE } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${SITE.domain}`;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Dynamic city pages
  const cityPages: MetadataRoute.Sitemap = Object.keys(locations).map(
    (city) => ({
      url: `${baseUrl}/shop/${city}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })
  );

  return [...staticPages, ...cityPages];
}

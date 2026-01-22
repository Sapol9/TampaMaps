import { Metadata } from "next";
import locations from "@/data/locations.json";
import { SITE } from "@/config/site";

type LocationKey = keyof typeof locations;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return Object.keys(locations).map((city) => ({
    city,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityKey = city as LocationKey;
  const location = locations[cityKey];

  if (!location) {
    return {
      title: "City Not Found | " + SITE.name,
    };
  }

  const title = `${location.displayName} Map Art | Premium 18x24 Canvas | ${SITE.name}`;
  const description = `Premium minimalist map canvas art of ${location.displayName}. Gallery-quality 18x24 prints featuring 17 unique styles. Free shipping included.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityLayout({ children }: LayoutProps) {
  return <>{children}</>;
}

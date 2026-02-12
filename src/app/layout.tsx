import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MapMarked | Premium Architectural Map Art",
  description:
    "Transform any location into museum-quality architectural art. 300 DPI precision vector maps on 18×24 gallery canvas. Free shipping on custom map prints.",
  keywords: [
    "architectural map art",
    "custom map canvas",
    "museum quality prints",
    "vector map art",
    "personalized wall art",
    "gallery wrap canvas",
    "minimalist map poster",
    "city map art",
    "architectural prints",
  ],
  openGraph: {
    title: "MapMarked | Premium Architectural Map Art",
    description:
      "Transform any location into museum-quality architectural art. 300 DPI precision on 18×24 gallery canvas.",
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MapMarked | Premium Architectural Map Art",
    description:
      "Transform any location into museum-quality architectural art. 300 DPI precision on 18×24 gallery canvas.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen bg-white dark:bg-neutral-950`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

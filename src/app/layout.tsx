import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MapMarked | Create Stunning Map Art in Seconds",
  description:
    "Print-ready custom maps of any place on Earth. Perfect for wall art, gifts, Etsy shops, and closing gifts. 300 DPI resolution.",
  keywords: [
    "map art generator",
    "custom map prints",
    "print-ready maps",
    "city map art",
    "wall art generator",
    "Etsy map prints",
    "real estate closing gifts",
    "personalized map art",
    "minimalist map poster",
  ],
  openGraph: {
    title: "MapMarked | Create Stunning Map Art in Seconds",
    description:
      "Print-ready custom maps of any place on Earth. Perfect for wall art, gifts, and Etsy shops.",
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MapMarked | Create Stunning Map Art in Seconds",
    description:
      "Print-ready custom maps of any place on Earth. Perfect for wall art, gifts, and Etsy shops.",
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
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen bg-[#0a0a0a]`}
      >
        {children}
      </body>
    </html>
  );
}
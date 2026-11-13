import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAMPUS-NEXUS · Cognitive Campus OS",
  description: "A cognitive operating system for higher education campuses.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#F7F0E8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className={jakarta.className}>{children}</body>
    </html>
  );
}

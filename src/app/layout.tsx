import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Editorial display serif for headlines.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

// Refined serif for dish names & engraved typographic cards.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Quiet, modern sans for body & UI.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anthony's Restaurant & Lounge — Italian Jewel on Grand Avenue",
  description:
    "Authentic home-cooked Italian in the heart of downtown Kansas City since 1978. Order online for pickup & delivery.",
  openGraph: {
    title: "Anthony's Restaurant & Lounge",
    description:
      "The Best Italian Cuisine — serving Grand Avenue since 1978.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-parchment text-espresso">{children}</body>
    </html>
  );
}

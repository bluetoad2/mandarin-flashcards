import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif_SC, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Editorial serif for pinyin and display text.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Song/Ming-style serif so the Hanzi reads as brushed ink rather than UI text.
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hanzi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mandarin Flashcards",
  description:
    "A calm, paper-and-ink Mandarin flashcard app with CSV import, spaced repetition and offline local storage.",
};

export const viewport: Viewport = {
  themeColor: "#F4F0E6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} ${notoSerifSC.variable}`}
    >
      <body className="bg-paper font-sans text-ink-800 antialiased">
        {children}
      </body>
    </html>
  );
}

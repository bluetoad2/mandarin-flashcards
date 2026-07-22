import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mandarin Flashcards",
  description:
    "A sleek, mobile-friendly Mandarin flashcard app with CSV import and offline local storage.",
};

export const viewport: Viewport = {
  themeColor: "#f0f9ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSC.variable}`}>
      <body className="font-sans text-slate-800 antialiased">{children}</body>
    </html>
  );
}

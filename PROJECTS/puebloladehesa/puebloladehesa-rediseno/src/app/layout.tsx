import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600"]
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
  weight: ["400", "500"]
});

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1
};

// Canonical domain — always falls back to prod URL when env var is missing.
// Localhost only used when explicitly set via NEXT_PUBLIC_SITE_URL=http://localhost:3000
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://puebloladehesa.cl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}

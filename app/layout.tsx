import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return new URL("http://localhost:3000");

  const absoluteUrl = /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`;
  const metadataBase = new URL(absoluteUrl);
  if (!["http:", "https:"].includes(metadataBase.protocol)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.");
  }
  return metadataBase;
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "PrimeQuest | Oil, Vessels & Properties",
  description: "PrimeQuest connects genuine sellers, buyers and investors across vessels, oil and gas, and property.",
  alternates: { canonical: "/" },
  icons: {
    icon: "/logo/official-logo.png",
    shortcut: "/logo/official-logo.png",
    apple: "/logo/official-logo.png",
  },
  openGraph: {
    title: "PrimeQuest | Oil, Vessels & Properties",
    description: "PrimeQuest connects genuine sellers, buyers and investors across vessels, oil and gas, property and agriculture.",
    type: "website",
    siteName: "PrimeQuest Oil and Properties Consultants",
    images: [{ url: "/primequest-share.svg", width: 1200, height: 630, alt: "PrimeQuest Oil, Vessels and Properties" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrimeQuest | Oil, Vessels & Properties",
    description: "Genuine assets. Clear direction. PrimeQuest connects serious buyers and sellers.",
    images: ["/primequest-share.svg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

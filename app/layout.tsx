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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "PrimeQuest | Oil, Vessels & Properties",
  description: "PrimeQuest connects genuine sellers, buyers and investors across vessels, oil and gas, and property.",
  icons: {
    icon: "/primequest-mark.svg",
    shortcut: "/primequest-mark.svg",
    apple: "/primequest-mark.svg",
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

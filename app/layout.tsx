import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PrimeQuestHeader from "@/components/PrimeQuestHeader";
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
  title: "PrimeQuest | Oil, Vessels & Properties",
  description: "PrimeQuest connects genuine sellers, buyers and investors across vessels, oil and gas, and property.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PrimeQuestHeader whatsappHref="https://wa.me/2348038128933?text=Hello%20PrimeQuest%2C%20I%20would%20like%20to%20discuss%20an%20opportunity." />
        {children}
      </body>
    </html>
  );
}

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
  title: "CSN Command Center | Clawnker Specialist Network",
  description: "Orchestrate AI agents on Solana with x402 payments. The decentralized coordination layer for the agent economy.",
  keywords: ["Solana", "AI Agents", "x402", "DeFi", "Multi-Agent", "Orchestration"],
  authors: [{ name: "Clawnker Team" }],
  openGraph: {
    title: "CSN Command Center",
    description: "The orchestration layer for Solana's agent economy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OddsRadar | Prediction Market Visualization",
  description:
    "Real-time radar for tracking odds, open interest, volume, and smart trader data from Polymarket and Kalshi prediction markets.",
  keywords: [
    "prediction markets",
    "polymarket",
    "kalshi",
    "open interest",
    "volume",
    "smart traders",
    "data visualization",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

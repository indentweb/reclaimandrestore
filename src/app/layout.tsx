import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import MobileActionBar from "@/components/MobileActionBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reclaim & Restore | Mobile Auto Detailing — North Alabama",
  description:
    "Reclaim & Restore is a mobile auto detailing company serving North Alabama. Steam cleaning, shampoo & extraction, full interior and exterior detailing. We come to you — book a date today.",
  keywords: [
    "mobile detailing",
    "auto detailing North Alabama",
    "steam cleaning",
    "car shampoo",
    "interior detailing",
    "exterior detailing",
    "Reclaim and Restore",
  ],
  openGraph: {
    title: "Reclaim & Restore | Mobile Auto Detailing",
    description:
      "Mobile steam, shampoo, interior & exterior detailing. We come to you anywhere in North Alabama.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-foreground">
        {children}
        <MobileActionBar />
      </body>
    </html>
  );
}

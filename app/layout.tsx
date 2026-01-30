import type { Metadata } from "next";
import { Boldonse, Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const boldonse = Boldonse({
  variable: "--font-boldonse",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "The Boring News | Tech News Aggregator",
    template: "%s | The Boring News",
  },
  description: "A clean, developer-focused tech news aggregator. No noise, just signal. Powered by RSS and verified sources.",
  keywords: ["tech news", "developer news", "software engineering", "programming", "startup news"],
  authors: [{ name: "The Boring Project" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://theboringnews.com",
    title: "The Boring News",
    description: "Curated technology updates from trusted sources.",
    siteName: "The Boring News",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Boring News",
    description: "Curated technology updates from trusted sources.",
    creator: "@theboringproject", 
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Boldonse&display=swap" rel="stylesheet"   />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${boldonse.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

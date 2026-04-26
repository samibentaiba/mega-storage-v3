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
  title: "Mega Storage V3 | Minecraft Inventory Dashboard",
  description: "Central command for the 22-chamber underground facility. A pixel-perfect recreation of the Minecraft 1.21 Creative Inventory for real-time item tracking and storage management.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/mega.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/mega.svg" }
    ]
  },
  openGraph: {
    title: "Mega Storage V3 | Minecraft Inventory",
    description: "Central command for the 22-chamber underground facility. A pixel-perfect recreation of the Minecraft 1.21 Creative Inventory.",
    url: "https://mega-storage-v3.com",
    siteName: "Mega Storage V3",
    images: [
      {
        url: "/Opengraph.png",
        width: 1200,
        height: 630,
        alt: "Mega Storage V3 Dashboard Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mega Storage V3 | Minecraft Inventory",
    description: "Central command for the 22-chamber underground facility. Real-time item tracking and storage management.",
    images: ["/Opengraph.png"],
  },
  keywords: ["Minecraft", "Storage", "Inventory", "Dashboard", "Creative Mode", "Next.js"],
  authors: [{ name: "Sami" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

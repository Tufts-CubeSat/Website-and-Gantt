import type { Metadata } from "next";
import { Syne, DM_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-home-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-home-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://tufts-cubesat.vercel.app";
const siteName = "Tufts CubeSat Team";
const siteDescription =
  "Tufts University's first CubeSat mission. The Tufts CubeSat Team is building SPACE RACCOON, a 2U satellite that detects, classifies, and assesses space debris risk in Low Earth Orbit using onboard computer vision and machine learning.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Tufts CubeSat",
    "Tufts CubeSat Team",
    "SPACE RACCOON",
    "CubeSat",
    "space debris",
    "Low Earth Orbit",
    "Tufts University",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/CubeSat-Logo1.png",
        width: 512,
        height: 512,
        alt: "Tufts CubeSat Team logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/CubeSat-Logo1.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${syne.variable} ${dmSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Navigation />
        <div className="md:ml-64 pt-16">{children}</div>
      </body>
    </html>
  );
}

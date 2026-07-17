import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HealthBanner } from "@/components/health-banner";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pipexi.com"),
  title: {
    default: "Pipexi — One place to run every workday",
    template: "%s | Pipexi",
  },
  description: "Schedule shifts, track time, assign tasks, and keep frontline teams in sync with Pipexi.",
  keywords: [
    "workforce management",
    "shift scheduling",
    "time tracking",
    "task management",
    "frontline teams",
    "employee scheduling",
    "team communication",
  ],
  authors: [{ name: "Pipexi" }],
  creator: "Pipexi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pipexi.com",
    siteName: "Pipexi",
    title: "Pipexi — One place to run every workday",
    description: "Schedule shifts, track time, assign tasks, and keep frontline teams in sync with Pipexi.",
    images: [
      {
        url: "/assets/logo/pipexi-logo.png",
        width: 1200,
        height: 630,
        alt: "Pipexi — One place to run every workday",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipexi — One place to run every workday",
    description: "Schedule shifts, track time, assign tasks, and keep frontline teams in sync with Pipexi.",
    images: ["/assets/logo/pipexi-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased scroll-smooth`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Suspense fallback={null}>
          <HealthBanner />
        </Suspense>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}

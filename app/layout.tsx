import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Great_Vibes, Monoton } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { SchemaMarkup } from "@/components/common/SchemaMarkup"
import "./globals.css"

// Optimized font loading with display swap and preload
const _geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist",
  adjustFontFallback: true, // Adjust fallback metrics to reduce CLS
})

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "optional", // Don't swap if not loaded quickly - reduces CLS
  preload: false, // Less critical, load after main font
  variable: "--font-geist-mono",
  adjustFontFallback: true,
})

const _greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: true, // Used heavily in navigation
  variable: "--font-great-vibes",
  adjustFontFallback: true, // Critical for CLS - this font causes most shift
})

const _monoton = Monoton({
  weight: "400",
  subsets: ["latin"],
  display: "optional", // Don't swap if not loaded - only used in one section
  preload: false, // Used only in Igraonica section
  variable: "--font-monoton",
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: "Xplorium - Explore the Extraordinary",
  description: "Interactive playground, sensory room, and cafe for families. Discover an extraordinary experience for children and parents.",
  keywords: ["playground", "sensory room", "cafe", "family", "interactive", "children", "Xplorium"],
  authors: [{ name: "Xplorium" }],
  creator: "Xplorium",
  publisher: "Xplorium",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://xplorium.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Xplorium - Explore the Extraordinary",
    description: "Interactive playground, sensory room, and cafe for families",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://xplorium.com",
    siteName: "Xplorium",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Xplorium - Interactive playground, sensory room, and cafe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xplorium - Explore the Extraordinary",
    description: "Interactive playground, sensory room, and cafe for families",
    images: ["/og-image.jpg"],
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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <SchemaMarkup />
      </head>
      <body className={`font-sans antialiased ${_geist.variable} ${_geistMono.variable} ${_greatVibes.variable} ${_monoton.variable}`} suppressHydrationWarning>
        <SessionProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" richColors closeButton />
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

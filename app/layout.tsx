import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import "./globals.css"

// Optimized font loading with display swap and preload
const _geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist",
})

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false, // Less critical, load after main font
  variable: "--font-geist-mono",
})

const _greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: true, // Used heavily in navigation
  variable: "--font-great-vibes",
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
  openGraph: {
    title: "Xplorium - Explore the Extraordinary",
    description: "Interactive playground, sensory room, and cafe for families",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xplorium - Explore the Extraordinary",
    description: "Interactive playground, sensory room, and cafe for families",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
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
      </head>
      <body className={`font-sans antialiased ${_geist.variable} ${_geistMono.variable} ${_greatVibes.variable}`}>
        <SessionProvider refetchInterval={60}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" richColors closeButton />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}

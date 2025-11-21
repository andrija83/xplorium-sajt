import { MetadataRoute } from 'next'

/**
 * Dynamic robots.txt Generation
 *
 * Tells search engines which pages to crawl
 * Next.js automatically serves this at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xplorium.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',       // Block admin panel
          '/api/',         // Block API routes
          '/profile/',     // Block user profiles (private)
          '/_next/',       // Block Next.js internals
          '/static/',      // Block static assets directory
        ],
      },
      {
        userAgent: 'GPTBot',      // ChatGPT crawler
        disallow: '/',             // Block AI crawlers (optional)
      },
      {
        userAgent: 'CCBot',        // Common Crawl
        disallow: '/',             // Block AI training data collection
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

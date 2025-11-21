/**
 * JSON-LD Schema Markup Component
 *
 * Provides structured data for search engines
 * Implements Schema.org LocalBusiness and FamilyFriendlyPlace types
 */
export function SchemaMarkup() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xplorium.com'

  const schemaData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EntertainmentBusiness"],
    "name": "Xplorium",
    "description": "Interactive playground, sensory room, and cafe for families. Discover an extraordinary experience for children and parents.",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "image": `${baseUrl}/og-image.jpg`,
    "telephone": "+1234567890", // TODO: Add real phone number
    "email": "info@xplorium.com", // TODO: Add real email
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street", // TODO: Add real address
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 0.0, // TODO: Add real coordinates
      "longitude": 0.0
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "10:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ],
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Interactive Playground",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Sensory Room",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Cafe",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Family Friendly",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Wheelchair Accessible",
        "value": true
      }
    ],
    "sameAs": [
      // TODO: Add social media links
      // "https://facebook.com/xplorium",
      // "https://instagram.com/xplorium",
      // "https://twitter.com/xplorium"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}

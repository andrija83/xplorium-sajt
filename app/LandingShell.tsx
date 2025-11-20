import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Xplorium - Family Entertainment Venue',
  description: 'Interactive playground, sensory room, and family cafe in one amazing space. Experience Xplorium - where fun meets discovery.',
  keywords: ['family entertainment', 'playground', 'sensory room', 'cafe', 'children activities'],
  openGraph: {
    title: 'Xplorium - Family Entertainment Venue',
    description: 'Interactive playground, sensory room, and family cafe in one amazing space.',
    type: 'website',
  },
}

/**
 * Server-side shell for the landing page
 * This component renders the static HTML structure that can be streamed to the client
 * The interactive components are lazy-loaded on the client side
 */
export default function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-black overflow-hidden">
      {children}
    </div>
  )
}

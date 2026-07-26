export interface Product {
  /** Small label above the card title. */
  tag: string
  title: string
  description: string
  /** Alt text for the card image, set per product rather than reusing the title. */
  imageAlt: string
  href: string
}

// Rendered by src/components/ServicesGrid.tsx and mirrored into the
// Organization's makesOffer by src/seo.ts — keep the copy here and nowhere else.
// These are packaged products, unlike the scoped engagements in ./services.ts.
export const PRODUCTS: Product[] = [
  {
    tag: 'Security',
    title: 'Data Leak Scan',
    description:
      "Enter your name, email, and phone to get a report of what’s publicly exposed about you online (leaked credentials, personal details, and more). ~2 business days.",
    imageAlt: 'Data Leak Scan report showing exposed credentials and personal details',
    href: 'https://buy.stripe.com/28E5kCh1p5JJfGc5Gd18c02',
  },
  {
    tag: 'Creative',
    title: 'AI Companion Apps',
    description: 'We design and build branded AI companions tailored to your audience, whether for ChatGPT or another platform.',
    imageAlt: 'Branded AI companion pet built as a custom ChatGPT app',
    href: 'https://tidycal.com/lmautomations/ai-companion',
  },
]

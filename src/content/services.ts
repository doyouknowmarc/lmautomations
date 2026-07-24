export interface ServiceTier {
  /** Heading as rendered on the card, including its trailing period. */
  title: string
  /** Human-readable price as rendered on the card. */
  price: string
  number: string
  items: string[]
  bookingUrl: string
  /** Tier name without the display period, used in JSON-LD. */
  serviceName: string
  serviceDescription: string
  /** Bounds of the price range in EUR; only the meaningful side is set. */
  minPrice?: number
  maxPrice?: number
}

// Rendered by src/components/Features.tsx and mirrored into the Organization's
// hasOfferCatalog by src/seo.ts — keep the prices here and nowhere else.
export const SERVICE_TIERS: ServiceTier[] = [
  {
    title: 'Small Projects.',
    price: 'Up to €10,000',
    number: '01',
    items: ['AI chatbots and custom assistants', 'Lead, CRM and outreach automation', 'Workflow and productivity tools'],
    bookingUrl: 'https://tidycal.com/doyouknowmarc/ai-automation-discovery-call-small-project',
    serviceName: 'Small Projects',
    serviceDescription: 'AI chatbots and custom assistants, lead, CRM and outreach automation, and workflow and productivity tools.',
    maxPrice: 10000,
  },
  {
    title: 'Growth Projects.',
    price: 'Up to €30,000',
    number: '02',
    items: ['Agentic automation systems', 'Sales, support and knowledge AI', 'CRM, ERP and document pipelines'],
    bookingUrl: 'https://tidycal.com/doyouknowmarc/ai-automation-discovery-call-growth-project',
    serviceName: 'Growth Projects',
    serviceDescription: 'Agentic automation systems, sales, support and knowledge AI, and CRM, ERP and document pipelines.',
    maxPrice: 30000,
  },
  {
    title: 'Enterprise & Custom.',
    price: '€30,000+',
    number: '03',
    items: ['Secure private-cloud deployments', 'Custom LLM platforms and integrations', 'Architecture, strategy and long-term support'],
    bookingUrl: 'https://tidycal.com/doyouknowmarc/ai-automation-discovery-call-custom-project',
    serviceName: 'Enterprise & Custom',
    serviceDescription: 'Secure private-cloud deployments, custom LLM platforms and integrations, and architecture, strategy and long-term support.',
    minPrice: 30000,
  },
]

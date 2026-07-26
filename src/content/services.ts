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
    items: ['AI chatbots and custom assistants', 'Lead, CRM and outreach automation', 'Workflow and productivity tools', 'Second Brain for your business'],
    bookingUrl: 'https://tidycal.com/lmautomations/ai-automation-discovery-call-small-project',
    serviceName: 'Small Projects',
    serviceDescription: 'AI chatbots and custom assistants, lead, CRM and outreach automation, and workflow and productivity tools.',
    maxPrice: 10000,
  },
  {
    title: 'Growth Projects.',
    price: 'Up to €30,000',
    number: '02',
    items: [
      'Agentic automation systems',
      'AI Tools for Sales & Support Agents',
      'CRM, ERP and document pipelines',
      '3D visualization and rendering for architecture and construction',
    ],
    bookingUrl: 'https://tidycal.com/lmautomations/ai-automation-discovery-call-growth-project',
    serviceName: 'Growth Projects',
    serviceDescription:
      'Agentic automation systems, AI Tools for sales & support agents, CRM, ERP and document pipelines, and 3D visualization and rendering for architecture and construction.',
    maxPrice: 30000,
  },
  {
    title: 'Custom.',
    price: '€5,000+',
    number: '03',
    items: ['AI Coaching: how to leverage AI as your superpower', 'Advisory: Consulting and Requirements Engineering', 'Speaker Gig: State of AI'],
    bookingUrl: 'https://tidycal.com/lmautomations/ai-automation-discovery-call-custom-project',
    serviceName: 'Custom',
    serviceDescription: 'AI coaching, advisory and requirements engineering, and speaking on the state of AI.',
    minPrice: 5000,
  },
]

export interface FAQItem {
  question: string
  intro?: string
  bullets?: string[]
  answer?: string
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What services do you offer?',
    intro: 'We help businesses automate repetitive work using AI and custom automation systems. Services include:',
    bullets: [
      'AI-powered business automation',
      'AI chatbots and AI voice agents',
      'Dropshipping automation',
      'Video editing and social media automation',
      'Real-time 3D visualization automation for construction and real estate',
      'CRM and workflow automation',
      'Custom AI solutions tailored to specific business workflows',
    ],
  },
  {
    question: 'Who are your target customers?',
    bullets: [
      'Entrepreneurs and small to medium-sized businesses',
      'E-commerce and dropshipping businesses',
      'Real estate developers, agencies, and renovation companies',
      'Content creators and influencers',
      'Companies looking to automate operations from lead generation to customer support',
    ],
  },
  {
    question: 'How long does a project take?',
    intro: 'Timelines scale with scope:',
    bullets: [
      'Small Projects (up to €10,000): up to 2 weeks',
      'Growth Projects (up to €30,000): up to 2 months',
      'Enterprise & Custom (€30,000+): no longer than 6 months',
    ],
  },
  {
    question: 'What makes you unique?',
    answer:
      'We build complete automation systems that we use in our own business first. Every solution is designed to eliminate manual work and integrate seamlessly into existing workflows.',
  },
  {
    question: 'What problem do you solve?',
    answer:
      'Businesses waste hundreds of hours every year on repetitive tasks. We replace manual processes with AI-driven automation so business owners can focus on growth instead of operations. Our goal is simple: give you back your time while reducing costs and increasing efficiency.',
  },
  {
    question: 'Who will I actually work with?',
    answer:
      "You'll work directly with us, Liam and Marc. For parts of the process you may also interact with AI avatars we've built ourselves, never with an outside contractor.",
  },
  {
    question: 'Are you bootstrapped, or open to outside investment?',
    answer:
      "We're bootstrapped, and we only take on client projects that fit our broader direction. Alongside client work, we're building automation products of our own that we don't share publicly yet. If investing in one of them interests you, reach out and we'll talk.",
  },
  {
    question: 'How can I contact or order from you?',
    answer:
      "The simplest way is to schedule a free discovery call using the booking link at the bottom of this page. We'll take it from there.",
  },
]

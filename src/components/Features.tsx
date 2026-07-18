import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { WordsPullUpMultiStyle } from './animations'

const CARD_EASE = [0.22, 1, 0.36, 1] as const

interface FeatureCardData {
  title: string
  price: string
  number: string
  items: string[]
  bookingUrl: string
}

const FEATURE_CARDS: FeatureCardData[] = [
  {
    title: 'Small Projects.',
    price: 'Up to €10,000',
    number: '01',
    items: ['AI chatbots and custom assistants', 'Lead, CRM and outreach automation', 'Workflow and productivity tools'],
    bookingUrl: 'https://tidycal.com/doyouknowmarc/ai-automation-discovery-call-small-project',
  },
  {
    title: 'Growth Projects.',
    price: 'Up to €30,000',
    number: '02',
    items: ['Agentic automation systems', 'Sales, support and knowledge AI', 'CRM, ERP and document pipelines'],
    bookingUrl: 'https://tidycal.com/doyouknowmarc/ai-automation-discovery-call-growth-project',
  },
  {
    title: 'Enterprise & Custom.',
    price: '€30,000+',
    number: '03',
    items: ['Secure private-cloud deployments', 'Custom LLM platforms and integrations', 'Architecture, strategy and long-term support'],
    bookingUrl: 'https://tidycal.com/doyouknowmarc/ai-automation-discovery-call-custom-project',
  },
]

function FeatureCard({ card }: { card: FeatureCardData }) {
  return (
    <div className="bg-[#212121] rounded-2xl p-5 sm:p-6 lg:p-7 flex flex-col h-full">
      <p className="text-[#DEDBC8]/50 text-xs tracking-widest">{card.number}</p>
      <h3 className="text-primary text-lg sm:text-xl mt-5 sm:mt-6">{card.title}</h3>
      <p className="mt-1 text-xs text-[#DEDBC8]/55">{card.price}</p>
      <ul className="mt-5 sm:mt-6 space-y-3 flex-1">
        {card.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check className="text-primary w-4 h-4 mt-0.5 shrink-0" />
            <span className="text-gray-400 text-xs sm:text-sm">{item}</span>
          </li>
        ))}
      </ul>
      <a
        href={card.bookingUrl}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-2 text-primary text-sm mt-6 self-start active:translate-y-px"
      >
        Book a discovery call
        <ArrowRight className="w-4 h-4 -rotate-45 transition-transform group-hover:rotate-0" />
      </a>
    </div>
  )
}

export default function Features() {
  const gridRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(gridRef, { once: true, margin: '-100px' })
  const shouldReduceMotion = useReducedMotion()

  const cardMotion = (index: number) => ({
    initial: shouldReduceMotion ? false as const : { opacity: 0, scale: 0.95 },
    animate: isInView ? { opacity: 1, scale: 1 } : {},
    transition: { delay: index * 0.15, duration: 0.8, ease: CARD_EASE },
  })

  return (
    <section id="solutions" aria-labelledby="solutions-heading" className="relative min-h-[100dvh] bg-black px-4 md:px-6 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <WordsPullUpMultiStyle
            as="h2"
            id="solutions-heading"
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal max-w-3xl"
            segments={[
              { text: 'Solutions built for your stage of growth.', className: 'text-primary' },
              { text: 'Focused systems. Measurable outcomes.', className: 'text-gray-500' },
            ]}
          />
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-5 lg:h-[480px]">
          <motion.div {...cardMotion(0)} className="relative rounded-2xl overflow-hidden min-h-[320px]">
            <picture>
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}liam-marc-team-640.webp 640w, ${import.meta.env.BASE_URL}liam-marc-team-1024.webp 1024w, ${import.meta.env.BASE_URL}liam-marc-team-1672.webp 1672w`}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              />
              <img
                src={`${import.meta.env.BASE_URL}liam-marc-team-1024.webp`}
                alt="Liam and Marc working together on AI automation projects"
                width="1672"
                height="941"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 text-lg sm:text-xl" style={{ color: '#E1E0CC' }}>
              Built for the work that moves your business forward.
            </p>
          </motion.div>

          {FEATURE_CARDS.map((card, index) => (
            <motion.div key={card.title} {...cardMotion(index + 1)} className="h-full">
              <FeatureCard card={card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

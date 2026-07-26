import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { WordsPullUpMultiStyle } from './animations'

const BODY_TEXT =
  // 'Liam and Marc met in Bali over a shared conviction: AI should create measurable business value—not just impressive demos. Together, we combine enterprise engineering standards with startup speed to design and build secure, compliant AI automations that integrate seamlessly into existing business processes. From small workflow improvements to company-wide AI systems, we help organizations automate repetitive work, improve decision-making, and scale efficiently.'
  'Liam and Marc met in Bali and realized they shared the same belief: AI gives businesses superpowers. Today, they help companies automate repetitive work, solve problems faster, and build AI tools teams actually enjoy using. They move fast, keep things practical, and focus on building things that make a real difference for their clients.'

function ScrollRevealParagraph({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.9], [0.35, 1])

  return (
    <motion.p ref={ref} className={`relative ${className ?? ''}`} style={{ opacity: shouldReduceMotion ? 1 : opacity }}>
      {text}
    </motion.p>
  )
}

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-black px-4 md:px-6 py-16 md:py-24">
      <div className="bg-[#101010] max-w-6xl mx-auto rounded-2xl md:rounded-[2rem] px-6 sm:px-10 md:px-16 py-16 sm:py-20 md:py-28 text-center">
        <p className="text-primary text-[10px] sm:text-xs uppercase tracking-widest mb-8 sm:mb-10">
          About us
        </p>

        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto leading-[0.95] sm:leading-[0.9]">
          <WordsPullUpMultiStyle
            as="h2"
            id="about-heading"
            style={{ color: '#E1E0CC' }}
            segments={[
              { text: 'We build AI systems', className: 'font-normal' },
              { text: 'that solve real business problems.', className: 'font-normal' },
            ]}
          />
        </div>

        <div className="max-w-2xl mx-auto mt-10 sm:mt-14">
          <ScrollRevealParagraph
            text={BODY_TEXT}
            className="text-[#DEDBC8] text-xs sm:text-sm md:text-base leading-relaxed"
          />
        </div>
      </div>
    </section>
  )
}

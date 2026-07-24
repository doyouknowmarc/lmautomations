import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { FAQ_ITEMS, FAQItem } from '../content/faq'
import { LAST_UPDATED_DISPLAY } from '../seo'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

function FAQRow({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const shouldReduceMotion = useReducedMotion()
  const panelId = `faq-panel-${item.question.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6"
      >
        <span className="text-sm text-[#E1E0CC] sm:text-base md:text-lg">{item.question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#DEDBC8]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: PANEL_EASE }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-8 sm:pb-6">
              {item.intro && (
                <p className="text-xs leading-relaxed text-[#DEDBC8]/70 sm:text-sm md:text-base">{item.intro}</p>
              )}
              {item.bullets && (
                <ul className={`space-y-2.5 ${item.intro ? 'mt-4' : ''}`}>
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5">
                      <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-xs leading-relaxed text-[#DEDBC8]/70 sm:text-sm md:text-base">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              {item.answer && (
                <p className="text-xs leading-relaxed text-[#DEDBC8]/70 sm:text-sm md:text-base">{item.answer}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#101010] text-[#E1E0CC]">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 md:py-28">
        <a
          href={import.meta.env.BASE_URL}
          className="text-xs text-[#DEDBC8]/60 transition-colors duration-200 hover:text-[#E1E0CC] md:text-sm"
        >
          &larr; Back to home
        </a>

        <header className="mt-10">
          <p className="text-[10px] tracking-[0.18em] text-[#DEDBC8]/55 md:text-xs">FAQ</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">Questions we get asked a lot.</h1>
        </header>

        <section
          aria-label="Frequently asked questions"
          className="mt-12 rounded-3xl border border-white/15 bg-[#171717] px-6 sm:px-8 md:px-10"
        >
          {FAQ_ITEMS.map((item, index) => (
            <FAQRow
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
            />
          ))}
        </section>

        <div className="mt-10 flex">
          <a
            href="https://tidycal.com/doyouknowmarc/ai-discovery-call"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 text-primary text-sm active:translate-y-px"
          >
            <span className="relative">
              Book a discovery call
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
            </span>
            <ArrowRight className="w-4 h-4 -rotate-45 transition-transform group-hover:rotate-0" />
          </a>
        </div>
      </main>

      <footer className="px-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/10 py-6 text-[10px] text-[#DEDBC8]/55 sm:text-xs md:py-7">
          <p>
            lmautomations <span className="hidden sm:inline">· Focused systems. Measurable outcomes.</span>{' '}
            <span className="text-[#DEDBC8]/40">· Last updated {LAST_UPDATED_DISPLAY}</span>
          </p>
          <span>FAQ</span>
        </div>
      </footer>
    </div>
  )
}

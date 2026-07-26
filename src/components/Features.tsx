import { ReactNode, useRef } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { SERVICE_TIERS, ServiceTier } from '../content/services'
import { WordsPullUpMultiStyle } from './animations'

const CARD_EASE = [0.22, 1, 0.36, 1] as const

// Maximum tilt (degrees) a card reaches when the cursor sits on its edge.
// Kept small so it reads as a material response, not a gimmick.
const CARD_MAX_TILT_DEG = 5

// The image's ambient zoom: how far it drifts in and how long one leg takes.
const IMAGE_ZOOM_SCALE = 1.08
const IMAGE_ZOOM_DURATION_S = 10

// Follows the cursor with a springy 3D tilt. Purely presentational — pointer
// tracking is local, and reduced-motion users get a static card.
function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const rotateX = useSpring(useMotionValue(0), { stiffness: 260, damping: 22 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 260, damping: 22 })

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || event.pointerType !== 'mouse') return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    // Cursor position relative to the card center, in [-0.5, 0.5]
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rotateX.set(-py * CARD_MAX_TILT_DEG * 2)
    rotateY.set(px * CARD_MAX_TILT_DEG * 2)
  }

  const handlePointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`h-full will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ card }: { card: ServiceTier }) {
  return (
    <div className="bg-[#212121] rounded-2xl p-5 sm:p-6 lg:p-7 flex flex-col h-full ring-1 ring-white/[0.06] transition-all duration-300 hover:bg-[#272725] hover:ring-[#E1E0CC]/25 hover:shadow-[0_12px_48px_-16px_rgba(225,224,204,0.18)]">
      <p className="text-[#DEDBC8]/50 text-xs tracking-widest">{card.number}</p>
      <h3 className="text-primary text-lg sm:text-xl mt-5 sm:mt-6">{card.title}</h3>
      <p className="mt-1 text-xs text-[#DEDBC8]/55">{card.price}</p>
      <ul className="mt-5 sm:mt-6 space-y-3 flex-1">
        {card.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check className="text-primary w-4 h-4 mt-0.5 shrink-0" />
            <span className="text-[#DEDBC8]/70 text-xs sm:text-sm">{item}</span>
          </li>
        ))}
      </ul>
      <a
        href={card.bookingUrl}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-2 text-primary text-sm mt-6 self-start active:translate-y-px"
      >
        <span className="relative">
          Book a discovery call
          {/* Underline sweep: grows from the first letter to the last in the font color. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
        </span>
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
              { text: 'Want us on your project?', className: 'text-primary' },
              { text: 'We solve your problems with AI, automation, and custom software.', className: 'text-[#DEDBC8]/50' },
            ]}
          />
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-5 lg:h-[480px]">
          <motion.div {...cardMotion(0)} className="h-full min-h-[320px]">
            <TiltCard>
              <div className="relative rounded-2xl overflow-hidden h-full min-h-[320px] ring-1 ring-white/[0.06] transition-shadow duration-300 hover:ring-[#E1E0CC]/25 hover:shadow-[0_12px_48px_-16px_rgba(225,224,204,0.18)]">
                {/* Ambient zoom: the photo slowly drifts in and back out so the card feels alive. */}
                <motion.div
                  className="absolute inset-0"
                  animate={shouldReduceMotion ? undefined : { scale: [1, IMAGE_ZOOM_SCALE] }}
                  transition={{ duration: IMAGE_ZOOM_DURATION_S, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
                >
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={`${import.meta.env.BASE_URL}liam-marc-footer-480.webp 480w, ${import.meta.env.BASE_URL}liam-marc-footer-720.webp 720w, ${import.meta.env.BASE_URL}liam-marc-footer-941.webp 941w`}
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    />
                    <img
                      src={`${import.meta.env.BASE_URL}liam-marc-footer-720.webp`}
                      alt="Liam and Marc working together on AI automation projects"
                      width="941"
                      height="1672"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </picture>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 text-lg sm:text-xl" style={{ color: '#E1E0CC' }}>
                  Keep it simple,<br /> make it work.
                </p>
              </div>
            </TiltCard>
          </motion.div>

          {SERVICE_TIERS.map((card, index) => (
            <motion.div key={card.title} {...cardMotion(index + 1)} className="h-full">
              <TiltCard>
                <FeatureCard card={card} />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

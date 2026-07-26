import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { PRODUCTS } from '../content/products'
import dataLeakImage from '../assets/data-leak.webp'
import aiCompanionImage from '../assets/AI-Companion-ChatGPT-Pet.webp'

// Asset URLs come from the bundler, so they stay here rather than in the
// content module; the copy is paired to an image by product title.
const PRODUCT_IMAGES: Record<string, string> = {
  'Data Leak Scan': dataLeakImage,
  'AI Companion Apps': aiCompanionImage,
}

function CardImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
      <span className="text-xs uppercase tracking-widest text-[#DEDBC8]/25">Image placeholder</span>
    </div>
  )
}

export default function ServicesGrid() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      id="products"
      aria-labelledby="products-heading"
      className="relative overflow-hidden bg-black px-6 py-28 md:py-40"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-2xl md:mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-[#DEDBC8]/40">Products</p>
          <h2 id="products-heading" className="mt-4 text-3xl tracking-tight text-[#E1E0CC] md:text-5xl">
            Things you can buy today.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#DEDBC8]/50 md:text-base">
            Explore our latest work and offerings: packaged for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {PRODUCTS.map((product, i) => {
            const image = PRODUCT_IMAGES[product.title]

            return (
              <motion.a
                key={product.title}
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="liquid-glass group block overflow-hidden rounded-3xl"
              >
                <div className="relative aspect-video overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={product.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <CardImagePlaceholder />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="p-6 md:p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-[#DEDBC8]/40">{product.tag}</span>
                    <div className="liquid-glass rounded-full p-2 text-[#E1E0CC]">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl tracking-tight text-[#E1E0CC] md:text-2xl">{product.title}</h3>
                  <p className="text-sm leading-relaxed text-[#DEDBC8]/50">{product.description}</p>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

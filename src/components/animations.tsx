import { CSSProperties, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const PULL_UP_EASE = [0.16, 1, 0.3, 1] as const

export interface StyledSegment {
  text: string
  className?: string
}

interface WordsPullUpMultiStyleProps {
  segments: StyledSegment[]
  className?: string
  style?: CSSProperties
  as?: 'div' | 'h2'
  id?: string
}

export function WordsPullUpMultiStyle({ segments, className = '', style, as: Tag = 'div', id }: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const shouldReduceMotion = useReducedMotion()
  const words = segments.flatMap((segment) =>
    segment.text.split(' ').map((word) => ({ word, className: segment.className ?? '' })),
  )

  return (
    <Tag ref={ref} id={id} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((item, i) => (
        <motion.span
          key={i}
          className={`inline-block ${item.className}`}
          initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.8, ease: PULL_UP_EASE }}
        >
          {item.word}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </motion.span>
      ))}
    </Tag>
  )
}

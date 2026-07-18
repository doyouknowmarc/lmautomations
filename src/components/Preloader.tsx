import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import liamMarcVideo from '../assets/liam-marc-video-optimized.mp4'
import liamMarcMobileVideo from '../assets/liam-marc-video-mobile.mp4'

// ============================================================================
// PRELOADER SETTINGS
// ============================================================================

// Minimum time the preloader stays visible, so it never flashes on fast
// connections (the reveal reads as intentional, not glitchy).
const MIN_DISPLAY_MS = 1400

// Hard ceiling: if an asset stalls (flaky network), we reveal anyway rather
// than trapping the user on the loading screen.
const MAX_WAIT_MS = 8000

// The reveal: the screen splits at the vertical center line and both halves
// swing open like doors onto the hero. A hard-accelerating ease sells the drama.
const REVEAL_EASE = [0.87, 0, 0.13, 1] as const
const REVEAL_DURATION_S = 1.05
const REVEAL_DELAY_S = 0.3
// The cream accent halves trail just behind the dark panels for depth.
const ACCENT_LAG_S = 0.14

function preloadFonts(): Promise<unknown> {
  return 'fonts' in document ? document.fonts.ready : Promise.resolve()
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

// Fetches enough of the hero video that playback won't stall. The element is
// detached and discarded — the browser cache makes the Hero's own <video>
// pick the data up instantly afterwards.
function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    const done = () => {
      video.removeAttribute('src')
      video.load()
      resolve()
    }
    video.addEventListener('canplaythrough', done, { once: true })
    video.addEventListener('error', done, { once: true })
    video.src = src
    video.load()
  })
}

interface PreloaderProps {
  onComplete: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const shouldReduceMotion = useReducedMotion()
  const [revealing, setRevealing] = useState(false)
  const [displayed, setDisplayed] = useState(0)
  const targetRef = useRef(0)
  const revealStartedRef = useRef(false)

  // Lock scrolling while the preloader owns the screen, and make sure the
  // page is at the very top so the hero starts in its idle-loop state.
  useEffect(() => {
    window.scrollTo(0, 0)
    const root = document.documentElement

    // Hiding overflow removes the scrollbar, which would widen the page by the
    // scrollbar's width and make the hero snap left when we unlock. Reserve that
    // exact width as padding so the layout width is identical before, during, and
    // after the reveal. (0 on overlay-scrollbar platforms — no compensation needed.)
    const scrollbarWidth = window.innerWidth - root.clientWidth
    const previousOverflow = root.style.overflow
    const previousPaddingRight = root.style.paddingRight

    root.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      root.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      root.style.overflow = previousOverflow
      root.style.paddingRight = previousPaddingRight
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const startedAt = performance.now()

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const tasks: Promise<unknown>[] = [
      preloadFonts(),
      preloadImage(`${import.meta.env.BASE_URL}liam-marc-video-poster.webp`),
      preloadVideo(isMobile ? liamMarcMobileVideo : liamMarcVideo),
    ]

    let settled = 0
    tasks.forEach((task) => {
      task.then(() => {
        settled += 1
        // Hold at 96% until everything (and the minimum time) is truly done.
        targetRef.current = Math.min(96, (settled / tasks.length) * 100)
      })
    })

    const finish = () => {
      if (cancelled) return
      targetRef.current = 100
    }

    const allDone = Promise.all(tasks).then(() => {
      const elapsed = performance.now() - startedAt
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
      return new Promise((resolve) => setTimeout(resolve, remaining))
    })

    const maxWait = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS))
    Promise.race([allDone, maxWait]).then(finish)

    // Smoothly ease the displayed number toward the real target every frame.
    let frameId = 0
    const tick = () => {
      if (cancelled) return
      setDisplayed((prev) => {
        const target = targetRef.current
        if (prev >= target) return prev
        return Math.min(target, prev + Math.max(0.35, (target - prev) * 0.055))
      })
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
    }
  }, [])

  // Once the counter visually lands on 100, start the reveal.
  useEffect(() => {
    if (displayed >= 99.5 && !revealStartedRef.current) {
      revealStartedRef.current = true
      setRevealing(true)
    }
  }, [displayed])

  const percent = Math.min(100, Math.round(displayed))

  // Door-panel variants. Each half slides fully out of view horizontally;
  // reduced-motion users get a plain fade instead.
  const panelVariants = (direction: -1 | 1, extraDelay = 0) =>
    shouldReduceMotion
      ? {
          idle: { opacity: 1 },
          exit: { opacity: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
        }
      : {
          idle: { x: '0%' },
          exit: {
            x: `${direction * 100}%`,
            transition: { duration: REVEAL_DURATION_S, ease: REVEAL_EASE, delay: REVEAL_DELAY_S + extraDelay },
          },
        }

  return (
    <>
      {/* Accent halves: briefly visible in the widening center gap, then follow the doors out. */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-y-0 left-0 w-1/2 z-[97] bg-[#E1E0CC]"
        initial={false}
        variants={panelVariants(-1, ACCENT_LAG_S)}
        animate={revealing ? 'exit' : 'idle'}
      />
      <motion.div
        aria-hidden="true"
        className="fixed inset-y-0 left-1/2 right-0 z-[97] bg-[#E1E0CC]"
        initial={false}
        variants={panelVariants(1, ACCENT_LAG_S)}
        animate={revealing ? 'exit' : 'idle'}
      />

      {/* Main dark doors, split at the vertical center line. */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-y-0 left-0 w-1/2 z-[98] bg-[#0b0b0b]"
        initial={false}
        variants={panelVariants(-1)}
        animate={revealing ? 'exit' : 'idle'}
        onAnimationComplete={(definition) => {
          if (definition === 'exit') onComplete()
        }}
      />
      <motion.div
        aria-hidden="true"
        className="fixed inset-y-0 left-1/2 right-0 z-[98] bg-[#0b0b0b]"
        initial={false}
        variants={panelVariants(1)}
        animate={revealing ? 'exit' : 'idle'}
      />

      {/* Content sits above both doors and fades out just before they open. */}
      <motion.div
        role="status"
        aria-label="Loading page"
        aria-busy={!revealing}
        className="fixed inset-0 z-[99] flex flex-col items-center justify-center pointer-events-none"
        animate={revealing ? { opacity: 0, scale: shouldReduceMotion ? 1 : 1.04 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeIn' }}
      >
        <div className="flex flex-col items-center px-6">
          <p
            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.05em]"
            style={{ color: '#E1E0CC' }}
          >
            Liam &amp; Marc
          </p>
          <p className="mt-4 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#DEDBC8]/45">
            Preparing your experience
          </p>

          <div className="mt-8 h-px w-48 sm:w-64 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#E1E0CC]"
              style={{ width: `${displayed}%`, transition: 'width 120ms linear' }}
            />
          </div>
          <p className="mt-3 text-xs tabular-nums text-[#DEDBC8]/55" aria-hidden="true">
            {percent}%
          </p>
        </div>
      </motion.div>
    </>
  )
}

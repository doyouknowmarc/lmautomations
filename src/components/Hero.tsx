import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { createVideoScrubber } from './video-scrubber'
import liamMarcVideo from '../assets/liam-marc-video-optimized.mp4'
import liamMarcMobileVideo from '../assets/liam-marc-video-mobile.mp4'

// ============================================================================
// CONFIGURABLE VIDEO SCRUBBING & PARALLAX SETTINGS
// ============================================================================

// 1. SCROLL START OFFSET (in pixels):
//    Change this offset if you want the user to scroll down further before the
//    video starts scrubbing. E.g., 100 means the video won't scrub for the first 100px.
const SCROLL_START_OFFSET_PX = 0

// 2. CONTENT REVEAL TRIGGER PROGRESS (0.0 to 1.0):
//    Scroll position is the sole source of truth for the video; the text reveal
//    begins at this point along the same 0..1 progress.
const CONTENT_REVEAL_START_PROGRESS = 0.38

// 3. CONTENT FULLY VISIBLE PROGRESS (0.0 to 1.0):
//    The copy and CTA share this exact reveal window so they move as one unit.
const CONTENT_REVEAL_END_PROGRESS = 0.47

// 4. INITIAL STATE ON PAGE LOAD (before scrolling starts):
//    - To hide them on page load and have them ONLY slide in after scrubbing:
//      Set CONTENT_INITIAL_Y = 100 and CONTENT_INITIAL_OPACITY = 0
//    - To show them on page load, have them fade out on initial scroll, then slide
//      back in after 1s of scrubbing:
//      Set CONTENT_INITIAL_Y = 0 and CONTENT_INITIAL_OPACITY = 1
const CONTENT_INITIAL_Y = 72
const CONTENT_INITIAL_OPACITY = 0

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))


export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldReduceMotion = useReducedMotion()

  // Create a motion value to track the current video scrubbing progress (from 0 to 1).
  const scrubProgress = useMotionValue(0)

  // Copy and CTA deliberately share one transform. Keeping them in a single
  // animated group prevents timing drift and makes the reveal read as one beat.
  const contentY = useTransform(
    scrubProgress,
    [0, CONTENT_REVEAL_START_PROGRESS, CONTENT_REVEAL_END_PROGRESS, 1],
    [CONTENT_INITIAL_Y, CONTENT_INITIAL_Y, 0, 0]
  )

  const contentOpacity = useTransform(
    scrubProgress,
    [0, CONTENT_REVEAL_START_PROGRESS, CONTENT_REVEAL_END_PROGRESS, 1],
    [CONTENT_INITIAL_OPACITY, CONTENT_INITIAL_OPACITY, 1, 1]
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (shouldReduceMotion) {
      video.pause()
      return
    }

    const scrubber = createVideoScrubber(video)
    let scrollFrameId = 0

    // The section's geometry is cached rather than read per scroll frame: touching
    // offsetTop/offsetHeight inside the scroll handler forces a synchronous layout
    // on every frame, which is exactly the work that stutters a sticky hero.
    let sectionTop = 0
    let scrollDistance = 0

    const measure = () => {
      const section = sectionRef.current
      if (!section) return
      sectionTop = section.offsetTop
      // Keep scrubbing while the sticky hero releases and travels out of view.
      scrollDistance = section.offsetHeight
    }

    const seekToScrollPosition = () => {
      if (scrollDistance <= 0) return

      // --- ADAPT FROM WHERE VIDEO SCROLLING STARTS ---
      // Active scroll amount, relative to the section top and our configurable offset.
      const activeScrollY = window.scrollY - sectionTop - SCROLL_START_OFFSET_PX
      const activeScrollDistance = scrollDistance - SCROLL_START_OFFSET_PX
      if (activeScrollDistance <= 0) return

      // Clamped, so an iOS rubber-band overscroll (negative scrollY) simply rests at
      // frame zero instead of flipping the video into a different state.
      const progress = clamp(activeScrollY / activeScrollDistance, 0, 1)

      // 1. Update the video scrubber
      scrubber.seekToProgress(progress)

      // 2. Update our motion value so the textbox and button parallax animate
      scrubProgress.set(progress)
    }

    const scheduleSeek = () => {
      if (scrollFrameId) return
      scrollFrameId = requestAnimationFrame(() => {
        scrollFrameId = 0
        seekToScrollPosition()
      })
    }

    // Only a width change can alter the section's geometry now that it is sized in
    // svh. Ignoring height-only resizes keeps iOS's collapsing URL bar — which fires
    // resize continuously mid-scroll — from remapping scroll progress under the finger.
    let lastWidth = window.innerWidth
    const handleResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      measure()
      seekToScrollPosition()
    }

    const handleLoadedMetadata = () => {
      scrubber.start(0)
      measure()
      // Sync immediately in case the page loaded already scrolled past the hero top.
      seekToScrollPosition()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    window.addEventListener('scroll', scheduleSeek, { passive: true })
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata()
    } else {
      measure()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      window.removeEventListener('scroll', scheduleSeek)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      cancelAnimationFrame(scrollFrameId)
      scrubber.stop()
      video.pause()
    }
  }, [scrubProgress, shouldReduceMotion])

  return (
    // The scroll track is sized in svh, not dvh, on purpose: dvh tracks iOS Safari's
    // live viewport, so a collapsing URL bar would grow this section mid-gesture and
    // shove every following section down under the user's finger.
    <section ref={sectionRef} aria-labelledby="hero-title" className={`${shouldReduceMotion ? 'h-[100svh]' : 'h-[200svh]'} bg-black p-4 md:p-6`}>
      {/* The card itself stays on dvh so it keeps filling the screen as the toolbar
          collapses. Its height is not in flow (the parent's height is explicit), so
          resizing it cannot move the page. */}
      <div className="sticky top-4 md:top-6 h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] w-full rounded-2xl md:rounded-[2rem] overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload={shouldReduceMotion ? 'none' : 'metadata'}
          poster={`${import.meta.env.BASE_URL}liam-marc-video-poster.webp`}
          width="1280"
          height="720"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={liamMarcMobileVideo} type="video/mp4" media="(max-width: 767px)" />
          <source src={liamMarcVideo} type="video/mp4" />
        </video>
        {/* Hidden outright on phones rather than merely un-blended: mix-blend-mode over a
            seeking video inside a rounded clip drops the video off iOS's compositor fast
            path, but without `overlay` this layer is a flat 45% grey wash that guts the
            video's colour. No grain at all is both cheaper and truer to the footage. */}
        <div className="hidden md:block absolute inset-0 noise-overlay opacity-[0.45] mix-blend-overlay pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-10 pb-6 md:pb-10">
          <div className="grid grid-cols-12 gap-5 md:gap-8 items-end">
            <div className="col-span-12 lg:col-span-8 overflow-visible">
              <h1 id="hero-title" className="sr-only">
                Liam and Marc Automations, custom AI automation systems
              </h1>
              <motion.div
                aria-hidden="true"
                className="whitespace-nowrap text-[12vw] sm:text-[11vw] md:text-[11vw] lg:text-[10vw] xl:text-[11vw] 2xl:text-[10vw] font-medium leading-[0.85] tracking-[-0.09em]"
                style={{ color: '#E1E0CC' }}
                initial={{ opacity: 1 }}
              >
                Liam &amp; <span className="relative inline-block">Marc<span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]"></span></span>
              </motion.div>
            </div>
            <motion.div
              className="col-span-12 lg:col-span-4 flex flex-col items-start gap-5 sm:gap-6 pb-2 md:pb-4 will-change-transform"
              style={{
                y: shouldReduceMotion ? 0 : contentY,
                opacity: shouldReduceMotion ? 1 : contentOpacity,
              }}
              initial={false}
            >
              <p
                className="text-primary/80 text-xs sm:text-sm md:text-base max-w-md"
                style={{ lineHeight: 1.35 }}
              >
                We build custom AI automations and intelligent agents that eliminate manual work, streamline operations, and accelerate business growth.
              </p>
              <a
                href={`https://tidycal.com/lmautomations/ai-discovery-call`}
                rel="noopener noreferrer"
                target="_blank"
                className="group bg-primary rounded-full flex items-center gap-2 hover:gap-3 active:translate-y-px pl-5 pr-1.5 py-1.5 text-black font-medium text-sm sm:text-base transition-all"
              >
                Book a discovery call
                <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#E1E0CC' }} />
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

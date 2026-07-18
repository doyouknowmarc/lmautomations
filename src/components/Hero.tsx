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

// 2. VIDEO INITIAL PROGRESS (0.0 to 1.0):
//    The progress/frame of the video where scrubbing begins.
//    Change this to start the video at a later time (e.g., 0.1 for 10% into the video).
const VIDEO_INITIAL_PROGRESS = 0.2

// 3. CONTENT REVEAL TRIGGER PROGRESS (0.0 to 1.0):
//    The video begins around 20% (roughly second two). The text reveal begins
//    around 18% later, which is approximately 1.5 seconds into the scrub.
const CONTENT_REVEAL_START_PROGRESS = 0.38

// 4. CONTENT FULLY VISIBLE PROGRESS (0.0 to 1.0):
//    The copy and CTA share this exact reveal window so they move as one unit.
const CONTENT_REVEAL_END_PROGRESS = 0.47

// 5. INITIAL STATE ON PAGE LOAD (before scrolling starts):
//    - To hide them on page load and have them ONLY slide in after scrubbing:
//      Set CONTENT_INITIAL_Y = 100 and CONTENT_INITIAL_OPACITY = 0
//    - To show them on page load, have them fade out on initial scroll, then slide
//      back in after 1s of scrubbing:
//      Set CONTENT_INITIAL_Y = 0 and CONTENT_INITIAL_OPACITY = 1
const CONTENT_INITIAL_Y = 72
const CONTENT_INITIAL_OPACITY = 0


export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldReduceMotion = useReducedMotion()

  // Create a motion value to track the current video scrubbing progress (from 0 to 1)
  const scrubProgress = useMotionValue(VIDEO_INITIAL_PROGRESS)

  // Copy and CTA deliberately share one transform. Keeping them in a single
  // animated group prevents timing drift and makes the reveal read as one beat.
  const contentY = useTransform(
    scrubProgress,
    [VIDEO_INITIAL_PROGRESS, CONTENT_REVEAL_START_PROGRESS, CONTENT_REVEAL_END_PROGRESS, 1],
    [CONTENT_INITIAL_Y, CONTENT_INITIAL_Y, 0, 0]
  )

  const contentOpacity = useTransform(
    scrubProgress,
    [VIDEO_INITIAL_PROGRESS, CONTENT_REVEAL_START_PROGRESS, CONTENT_REVEAL_END_PROGRESS, 1],
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
    const introFinishedRef = { current: false }
    const introStartedRef = { current: false }
    let introFrameId: number
    let scrollFrameId: number
    let safetyTimeout: ReturnType<typeof setTimeout>

    const seekToScrollPosition = () => {
      // Ignore scroll position during the intro play-in
      if (!introFinishedRef.current) return

      const section = sectionRef.current
      if (!section) return

      const sectionTop = section.offsetTop
      // Keep scrubbing while the sticky hero releases and travels out of view.
      const scrollDistance = section.offsetHeight
      if (scrollDistance <= 0) return

      // --- ADAPT FROM WHERE VIDEO SCROLLING STARTS ---
      // We calculate the active scroll amount relative to the section top and our configurable offset.
      const activeScrollY = window.scrollY - sectionTop - SCROLL_START_OFFSET_PX
      const activeScrollDistance = scrollDistance - SCROLL_START_OFFSET_PX

      // Calculate scroll progress clamped between 0 and 1
      const rawProgress = activeScrollDistance > 0
        ? Math.max(0, Math.min(1, activeScrollY / activeScrollDistance))
        : 0

      // Map scroll progress to video scrubbing progress starting from our offset
      const videoProgress = VIDEO_INITIAL_PROGRESS + rawProgress * (1 - VIDEO_INITIAL_PROGRESS)

      // 1. Update the video scrubber
      scrubber.seekToProgress(videoProgress)

      // 2. Update our motion value so the textbox and button parallax animate
      scrubProgress.set(videoProgress)
    }

    const finishIntro = () => {
      if (introFinishedRef.current) return
      introFinishedRef.current = true

      clearTimeout(safetyTimeout)
      cancelAnimationFrame(introFrameId)
      video.pause()

      // Hand control over to the scrubber starting from the current time
      scrubber.start(video.currentTime)

      if (Number.isFinite(video.duration) && video.duration > 0) {
        scrubProgress.set(video.currentTime / video.duration)
      } else {
        scrubProgress.set(VIDEO_INITIAL_PROGRESS)
      }

      // Sync the scrubber with the current scroll position immediately
      seekToScrollPosition()
    }

    const startIntro = () => {
      if (introStartedRef.current) return
      introStartedRef.current = true
      video.muted = true
      video.currentTime = 0

      // Autoplay the video for the intro play-in phase
      video.play().catch((err) => {
        console.warn('Autoplay check failed or was blocked by browser:', err)
        // If autoplay is blocked, transition to scroll control immediately
        finishIntro()
      })

      // We want to play the video until it reaches VIDEO_INITIAL_PROGRESS of its duration.
      const duration = video.duration
      const targetIntroTime = Number.isFinite(duration) && duration > 0
        ? VIDEO_INITIAL_PROGRESS * duration
        : 1.0 // Fallback to 1 second

      const checkIntro = () => {
        if (video.currentTime >= targetIntroTime) {
          finishIntro()
        } else {
          introFrameId = requestAnimationFrame(checkIntro)
        }
      }

      introFrameId = requestAnimationFrame(checkIntro)

      // Safety timeout: if intro hasn't finished in 3.5 seconds, force finish it
      safetyTimeout = setTimeout(() => {
        if (!introFinishedRef.current) {
          finishIntro()
        }
      }, 3500)
    }

    const scheduleSeek = () => {
      if (scrollFrameId) return
      scrollFrameId = requestAnimationFrame(() => {
        scrollFrameId = 0
        seekToScrollPosition()
      })
    }

    video.addEventListener('loadedmetadata', startIntro)
    window.addEventListener('scroll', scheduleSeek, { passive: true })

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startIntro()
    }

    return () => {
      video.removeEventListener('loadedmetadata', startIntro)
      window.removeEventListener('scroll', scheduleSeek)
      cancelAnimationFrame(introFrameId)
      cancelAnimationFrame(scrollFrameId)
      clearTimeout(safetyTimeout)
      scrubber.stop()
    }
  }, [scrubProgress, shouldReduceMotion])

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className={`${shouldReduceMotion ? 'h-[100dvh]' : 'h-[200dvh]'} bg-black p-4 md:p-6`}>
      <div className="sticky top-4 md:top-6 relative h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] w-full rounded-2xl md:rounded-[2rem] overflow-hidden">
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
        {/* Fade-in from black overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          className="absolute inset-0 bg-black pointer-events-none z-10"
        />
        <div className="absolute inset-0 noise-overlay opacity-[0.45] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/75" />

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-10 pb-6 md:pb-10">
          <div className="grid grid-cols-12 gap-5 md:gap-8 items-end">
            <div className="col-span-12 lg:col-span-8 overflow-visible">
              <h1 id="hero-title" className="sr-only">
                Liam and Marc Automations — custom AI automation systems
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
                href={`https://tidycal.com/doyouknowmarc/ai-automation-discovery-call-60-minutes`}
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

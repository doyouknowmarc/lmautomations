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

// 2. IDLE LOOP DURATION (in seconds):
//    While the hero is at rest (page load, or scrolled back to the very top),
//    only this opening window of the video loops, so the page stays visually
//    alive without playing the whole animation. Keep it short (1-3s); scroll
//    scrubbing takes over from here through to the end of the video.
const IDLE_LOOP_DURATION_SECONDS = 0

// 3. IDLE LOOP PLAYBACK RATE (0.25x-0.5x):
//    Slowed down so the idle loop reads as subtle ambient motion rather than
//    an obviously repeating clip.
const IDLE_LOOP_PLAYBACK_RATE = 0.4

// 4. CONTENT REVEAL TRIGGER PROGRESS (0.0 to 1.0):
//    Once scroll scrubbing takes over (right after the idle loop window), the
//    text reveal begins here.
const CONTENT_REVEAL_START_PROGRESS = 0.38

// 5. CONTENT FULLY VISIBLE PROGRESS (0.0 to 1.0):
//    The copy and CTA share this exact reveal window so they move as one unit.
const CONTENT_REVEAL_END_PROGRESS = 0.47

// 6. INITIAL STATE ON PAGE LOAD (before scrolling starts):
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
  // Only meaningful once scroll scrubbing takes over; it sits at 0 during the idle loop.
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

    // State machine:
    // - 'idle': the opening window plays as a *reverse loop* (forward, then backward, then
    //   forward again) so there is never a hard jump cut. The forward leg uses native slow
    //   playback (smooth); the backward leg is driven by gated seeks, since HTML video has
    //   no native reverse playback.
    // - 'scrubbing': the video never plays on its own; scroll position is the sole source of truth.
    let mode: 'idle' | 'scrubbing' = 'idle'
    let scrollFrameId = 0
    let idleLoopFrameId = 0
    let lastFrameTs = 0

    // Reverse-loop state. Position (seconds) and direction are preserved across a scrub
    // excursion, so returning to the top resumes the loop exactly where it left off.
    let reversePosition = 0
    let idleDirection: 1 | -1 = 1

    // Video progress (0..1) where scrubbing began. Scroll maps [handoffProgress .. 1], so the
    // scrub starts from wherever the idle loop currently is, and scrolling back up scrubs in
    // reverse to that exact point before the idle loop takes over again.
    let handoffProgress = 0

    const idleLoopEndSeconds = () => (
      Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(IDLE_LOOP_DURATION_SECONDS, video.duration)
        : IDLE_LOOP_DURATION_SECONDS
    )

    const playIdleForward = () => {
      idleDirection = 1
      video.playbackRate = IDLE_LOOP_PLAYBACK_RATE
      video.play().catch(() => {
        // Autoplay blocked: the ambient loop won't animate until the user interacts.
      })
    }

    const beginIdleReverse = () => {
      idleDirection = -1
      video.pause()
      reversePosition = video.currentTime
      lastFrameTs = 0
    }

    // Watches the loop bounds every frame. Forward motion is real (slow) playback; when the
    // window's end is reached we flip into a seek-driven backward leg, and at 0 we flip back.
    const runIdleLoop = (ts: number) => {
      if (mode !== 'idle') return

      if (idleDirection === 1) {
        if (video.currentTime >= idleLoopEndSeconds()) {
          beginIdleReverse()
        }
      } else {
        if (!lastFrameTs) lastFrameTs = ts
        // Clamp the frame delta so a background-tab pause can't cause a visible jump.
        const deltaSeconds = Math.min((ts - lastFrameTs) / 1000, 0.1)
        lastFrameTs = ts

        reversePosition = Math.max(0, reversePosition - IDLE_LOOP_PLAYBACK_RATE * deltaSeconds)
        // Only issue a new seek once the previous one has landed — overlapping seeks are
        // what makes reverse playback look choppy.
        if (!video.seeking) {
          video.currentTime = reversePosition
        }
        if (reversePosition <= 0) {
          playIdleForward()
        }
      }

      idleLoopFrameId = requestAnimationFrame(runIdleLoop)
    }

    // Resumes/starts the reverse loop from a given time, keeping the current direction.
    const startIdleLoop = (fromTime: number) => {
      mode = 'idle'
      scrubber.stop()
      cancelAnimationFrame(idleLoopFrameId)

      video.muted = true
      const clamped = clamp(fromTime, 0, idleLoopEndSeconds())
      video.currentTime = clamped

      // idleDirection is intentionally preserved so the loop continues where it left off.
      if (idleDirection === 1) {
        playIdleForward()
      } else {
        video.pause()
        reversePosition = clamped
        lastFrameTs = 0
      }

      idleLoopFrameId = requestAnimationFrame(runIdleLoop)
    }

    const enterScrubbing = () => {
      if (mode === 'scrubbing') return
      mode = 'scrubbing'
      cancelAnimationFrame(idleLoopFrameId)
      // The exact point the idle loop is on right now becomes the scrub's origin.
      handoffProgress = Number.isFinite(video.duration) && video.duration > 0
        ? clamp(video.currentTime / video.duration, 0, 1)
        : 0
      scrubber.start(video.currentTime)
    }

    const seekToScrollPosition = () => {
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
      const atTop = activeScrollY <= 0

      if (atTop) {
        // Back at the very top: the scrub has eased back to the handoff point. Hand control
        // to the reverse loop, resuming from there and continuing in its preserved direction.
        if (mode === 'scrubbing') {
          startIdleLoop(video.currentTime)
        }
        return
      }

      if (mode === 'idle') {
        enterScrubbing()
      }

      // Calculate scroll progress clamped between 0 and 1
      const rawProgress = activeScrollDistance > 0
        ? clamp(activeScrollY / activeScrollDistance, 0, 1)
        : 0

      // Map scroll progress from the handoff point through to the end of the video.
      const videoProgress = handoffProgress + rawProgress * (1 - handoffProgress)

      // 1. Update the video scrubber
      scrubber.seekToProgress(videoProgress)

      // 2. Update our motion value so the textbox and button parallax animate
      scrubProgress.set(videoProgress)
    }

    const scheduleSeek = () => {
      if (scrollFrameId) return
      scrollFrameId = requestAnimationFrame(() => {
        scrollFrameId = 0
        seekToScrollPosition()
      })
    }

    const handleLoadedMetadata = () => {
      startIdleLoop(0)
      // Sync immediately in case the page loaded already scrolled past the hero top.
      seekToScrollPosition()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    window.addEventListener('scroll', scheduleSeek, { passive: true })

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      window.removeEventListener('scroll', scheduleSeek)
      cancelAnimationFrame(idleLoopFrameId)
      cancelAnimationFrame(scrollFrameId)
      scrubber.stop()
      video.pause()
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

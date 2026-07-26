export interface VideoScrubber {
  start: (initialTime?: number) => void
  seekToProgress: (progress: number) => void
  stop: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const SEEK_EASING = 0.24

// The encode is 30fps (253 frames over 8.4333s). Seek targets are snapped to this
// grid: a sub-frame target still costs a full decoder flush but cannot change a pixel,
// and on Android those wasted flushes are what make scrubbing stutter.
const VIDEO_FPS = 30
const FRAME_SECONDS = 1 / VIDEO_FPS
const snapToFrame = (seconds: number) => Math.round(seconds * VIDEO_FPS) / VIDEO_FPS

// Half a frame. Browsers snap a seek to their own frame grid, so currentTime after a
// seek is never exactly the value we asked for — comparing for equality would keep the
// chase loop running forever. Everything within half a frame is the same picture.
const SETTLE_THRESHOLD = FRAME_SECONDS / 2

// If a frame callback never arrives (backgrounded tab, decoder hiccup) the pipeline
// would deadlock with awaitingFrame stuck true and no further seeks issued. Release it.
const FRAME_STALL_MS = 400

// Touch scrolling is already continuous, so easing only adds lag: the video visibly
// trails the finger and keeps seeking after the gesture ends. A mouse wheel arrives
// in discrete jumps, which is where the easing genuinely helps.
const prefersEasedSeeking = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: fine)').matches
    : true

export function createVideoScrubber(video: HTMLVideoElement): VideoScrubber {
  let isStarted = false
  let targetTime = 0
  let animationFrame = 0
  let frameCallback = 0
  const useEasing = prefersEasedSeeking()

  // requestVideoFrameCallback tells us when a seeked frame is actually on screen.
  // video.seeking, by contrast, can clear before the compositor has presented anything,
  // so polling it lets us stack a second decoder flush onto a pipeline that has not
  // caught up yet — precisely the "chunking" Android users see.
  const hasFrameCallback = typeof video.requestVideoFrameCallback === 'function'

  let seekIssuedAt = 0
  // True from the moment a seek is issued until its frame lands. Guarantees exactly one
  // seek in flight, which is what the old video.seeking poll failed to do.
  let awaitingFrame = false
  let onSeeked: (() => void) | null = null

  const isAtTarget = () => Math.abs(targetTime - video.currentTime) <= SETTLE_THRESHOLD

  // Last resort only: with `seeked` in the race below, neither signal arriving means
  // something is wrong with the pipeline itself rather than with one browser's API.
  const releaseIfStalled = () => {
    if (!awaitingFrame || performance.now() - seekIssuedAt < FRAME_STALL_MS) return
    clearWaiters()
    awaitingFrame = false
  }

  function clearWaiters() {
    if (onSeeked) video.removeEventListener('seeked', onSeeked)
    onSeeked = null
    if (frameCallback && typeof video.cancelVideoFrameCallback === 'function') {
      video.cancelVideoFrameCallback(frameCallback)
    }
    frameCallback = 0
  }

  const commitSeek = (time: number) => {
    seekIssuedAt = performance.now()
    awaitingFrame = true

    const settle = () => {
      if (!awaitingFrame) return
      awaitingFrame = false
      clearWaiters()
      // The frame is up; if scroll moved on while we waited, chase it now.
      if (isStarted && !isAtTarget()) scheduleRender()
    }

    // Race two completion signals and take whichever arrives first.
    //
    // `seeked` is universally supported and is the ONLY signal Safari gives here: its
    // requestVideoFrameCallback does not fire for a paused video being seeked, only
    // during playback. Relying on rVFC alone made every iOS seek wait out the watchdog.
    //
    // rVFC, where it does fire (Chrome/Android), is the better signal — it means the
    // frame is actually on screen, whereas `seeked` can resolve a beat earlier.
    onSeeked = settle
    video.addEventListener('seeked', onSeeked, { once: true })

    if (hasFrameCallback) {
      frameCallback = video.requestVideoFrameCallback!(() => {
        frameCallback = 0
        settle()
      })
    }

    video.currentTime = time
  }

  const renderFrame = () => {
    animationFrame = 0
    if (!isStarted) return

    // Never stack a new seek on top of one still in flight. Desktop decoders land seeks
    // within a frame so this changes nothing there, but on mobile unthrottled writes
    // queue up and cause visible lag.
    releaseIfStalled()
    if (awaitingFrame) return
    if (isAtTarget()) return

    // settle() re-schedules us once the seek lands, so an eased chase keeps stepping
    // and a direct seek simply waits for the next scroll update. No polling either way.
    if (useEasing) {
      commitSeek(snapToFrame(video.currentTime + (targetTime - video.currentTime) * SEEK_EASING))
    } else {
      commitSeek(targetTime)
    }
  }

  function scheduleRender() {
    releaseIfStalled()
    if (awaitingFrame || animationFrame) return
    animationFrame = window.requestAnimationFrame(renderFrame)
  }

  const cancelPending = () => {
    window.cancelAnimationFrame(animationFrame)
    // Reset the frame handle, otherwise scheduleRender() thinks a frame is
    // still pending after a stop/start cycle and the render loop never resumes.
    animationFrame = 0
    clearWaiters()
    awaitingFrame = false
  }

  return {
    start: (initialTime?: number) => {
      video.muted = true
      video.pause()
      cancelPending()
      targetTime = snapToFrame(initialTime ?? 0)
      video.currentTime = targetTime
      isStarted = true
      scheduleRender()
    },
    seekToProgress: (progress: number) => {
      if (!isStarted || !Number.isFinite(video.duration)) return
      targetTime = snapToFrame(clamp(progress, 0, 1) * video.duration)
      scheduleRender()
    },
    stop: () => {
      isStarted = false
      cancelPending()
      video.pause()
    },
  }
}

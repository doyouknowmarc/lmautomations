export interface VideoScrubber {
  start: (initialTime?: number) => void
  seekToProgress: (progress: number) => void
  stop: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const SEEK_EASING = 0.24
const SETTLE_THRESHOLD = 0.002

export function createVideoScrubber(video: HTMLVideoElement): VideoScrubber {
  let isStarted = false
  let targetTime = 0
  let animationFrame = 0

  const renderFrame = () => {
    if (!isStarted) return

    // Never stack a new seek on top of one still in flight. Desktop decoders
    // land seeks within a frame so this changes nothing there, but on mobile
    // (especially Android) unthrottled writes queue up and cause visible lag.
    if (video.seeking) {
      animationFrame = window.requestAnimationFrame(renderFrame)
      return
    }

    const distance = targetTime - video.currentTime
    if (Math.abs(distance) > SETTLE_THRESHOLD) {
      video.currentTime += distance * SEEK_EASING
      animationFrame = window.requestAnimationFrame(renderFrame)
    } else if (video.currentTime !== targetTime) {
      video.currentTime = targetTime
      animationFrame = 0
    } else {
      animationFrame = 0
    }
  }

  const scheduleRender = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(renderFrame)
  }

  return {
    start: (initialTime?: number) => {
      video.muted = true
      video.pause()
      if (initialTime !== undefined) {
        targetTime = initialTime
        video.currentTime = initialTime
      } else {
        targetTime = 0
        video.currentTime = 0
      }
      isStarted = true
      scheduleRender()
    },
    seekToProgress: (progress: number) => {
      if (!isStarted || !Number.isFinite(video.duration)) return
      targetTime = clamp(progress, 0, 1) * video.duration
      scheduleRender()
    },
    stop: () => {
      isStarted = false
      window.cancelAnimationFrame(animationFrame)
      // Reset the frame handle, otherwise scheduleRender() thinks a frame is
      // still pending after a stop/start cycle and the render loop never resumes.
      animationFrame = 0
      video.pause()
    },
  }
}

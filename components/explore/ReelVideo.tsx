'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'

/** Shared play/sound state for a reel's video (the title bar's sound button reads it) */
export function useReelVideo() {
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true) // autoplay must start muted on phones
  return { paused, setPaused, muted, toggleMute: () => setMuted(m => !m) }
}

type Controls = ReturnType<typeof useReelVideo>

/** Lets the reel's title bar (a sibling of the video) show the sound button */
export const VideoControls = createContext<Controls | null>(null)

interface Props {
  src: string
  poster?: string
  title: string
  muted: boolean
  paused: boolean
  onPausedChange: (paused: boolean) => void
}

/**
 * Reel video, filling the 9:16 card like the TikTok app. A native <video> doesn't
 * swallow touches, so swipes reach the page for reel paging
 * and a tap toggles play/pause. Sound lives in the title bar (<MuteButton>).
 */
export default function ReelVideo({ src, poster, title, muted, paused, onPausedChange }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  // React doesn't keep the `muted` property in sync after mount, so apply it here
  useEffect(() => {
    if (ref.current) ref.current.muted = muted
  }, [muted])

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        aria-label={title}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => onPausedChange(false)}
        onPause={() => onPausedChange(true)}
        onClick={() => {
          const v = ref.current
          if (v) v.paused ? void v.play() : v.pause()
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {paused && (
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] flex items-center justify-center w-16 h-16 rounded-full pointer-events-none"
          style={{ backgroundColor: 'rgba(5,2,6,0.45)', backdropFilter: 'blur(4px)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(251,255,244,0.9)">
            <path d="M7 4.5L19.5 12L7 19.5V4.5Z" />
          </svg>
        </span>
      )}
    </>
  )
}

/** Sound toggle for the reel's video; renders nothing when the reel isn't playing one */
export function MuteButton() {
  const controls = useContext(VideoControls)
  if (!controls) return null
  return (
    <button
      onClick={controls.toggleMute}
      aria-label={controls.muted ? 'Unmute' : 'Mute'}
      aria-pressed={!controls.muted}
      className="p-1 flex-shrink-0 transition-transform active:scale-90"
      style={{ color: 'rgba(251,255,244,0.7)' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d={controls.muted ? 'M23 9l-6 6M17 9l6 6' : 'M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14'} />
      </svg>
    </button>
  )
}

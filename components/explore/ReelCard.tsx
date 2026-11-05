'use client'

import type { ReactNode } from 'react'
import type { Reel } from './types'
import ReelVideo, { MuteButton, useReelVideo, VideoControls } from './ReelVideo'

// Shared with the detail panel so both line up top and bottom
const CARD_WIDTH = 300
export const CARD_HEIGHT = 500

export interface ReelCardProps {
  reel: Reel
  isActive: boolean
  width?: number
  height?: number
  /** Play the reel's uploaded video (if it has one) inside the card */
  video?: boolean
  /** Replaces the default bottom title block (mobile: tap-to-expand details) */
  overlay?: ReactNode
}

export default function ReelCard({ reel, isActive, width = CARD_WIDTH, height = CARD_HEIGHT, video, overlay }: ReelCardProps) {
  const videoSrc = video ? reel.videoUrl : undefined
  const controls = useReelVideo()

  return (
    <div
      className="relative flex-shrink-0 rounded-2xl overflow-hidden select-none"
      style={{
        width,
        height,
        // Poster frame when there is one, so idle reels look like their video
        background: reel.thumbnailUrl
          ? `url(${reel.thumbnailUrl}) center/cover`
          : `linear-gradient(160deg, ${reel.bgGradient[0]}, ${reel.bgGradient[1]})`,
        boxShadow: isActive
          ? '0 0 0 1px hsl(var(--border)), 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(154,129,116,0.08)'
          : '0 8px 24px rgba(0,0,0,0.6)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <VideoControls.Provider value={videoSrc ? controls : null}>
        {videoSrc ? (
          <ReelVideo
            src={videoSrc}
            poster={reel.thumbnailUrl}
            title={reel.title}
            muted={controls.muted}
            paused={controls.paused}
            onPausedChange={controls.setPaused}
          />
        ) : (
          <>
            {/* Subtle grid texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 39px, hsl(var(--border)) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, hsl(var(--border)) 40px)',
              }}
            />

            {/* Centre play icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(251,255,244,0.85)">
                  <path d="M7 4.5L19.5 12L7 19.5V4.5Z" />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* Category badge (also over video) */}
        <span
          className="absolute top-4 left-4 z-10 pointer-events-none text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded"
          style={{
            backgroundColor: videoSrc ? 'rgba(5,2,6,0.55)' : 'rgba(154,129,116,0.15)',
            border: '1px solid rgba(154,129,116,0.3)',
            color: 'hsl(var(--primary))',
          }}
        >
          {reel.category}
        </span>

        {overlay ?? (
          <div
            className="absolute bottom-0 left-0 right-0 z-10 p-4"
            style={{ background: 'linear-gradient(to top, rgba(5,2,6,0.95) 0%, rgba(5,2,6,0.7) 60%, transparent 100%)' }}
          >
            <p className="text-[11px] font-medium tracking-wider uppercase mb-1 text-primary">
              {reel.modification}
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{reel.title}</p>
            <div className="flex items-end justify-between gap-2 mt-1">
              <p className="text-xs" style={{ color: 'rgba(251,255,244,0.45)' }}>{(reel.author ?? reel.seller).handle}</p>
              {/* Sound for the video (renders only when this card is playing one) */}
              <MuteButton />
            </div>
          </div>
        )}
      </VideoControls.Provider>

      {/* Active glow ring */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(154,129,116,0.4)' }}
        />
      )}
    </div>
  )
}

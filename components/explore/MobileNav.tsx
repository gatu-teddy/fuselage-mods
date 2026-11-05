'use client'

import { useRef } from 'react'

interface Props {
  activeIndex: number
  total: number
  onNavigate: (dir: 1 | -1) => void
  /** Jump straight to a reel (tap a dot / scrub) */
  onSelect: (index: number) => void
}

const WINDOW = 7 // dots shown at once; the window slides with the active reel
const SCRUB_PX = 14 // horizontal drag distance per reel while scrubbing

/** Mobile prev/next reel strip (the page tab bar lives in TabBar, shared via layout) */
export default function MobileNav({ activeIndex, total, onNavigate, onSelect }: Props) {
  const scrub = useRef<{ x: number; index: number; moved: boolean } | null>(null)
  const clamp = (i: number) => Math.min(Math.max(i, 0), total - 1)

  const count = Math.min(total, WINDOW)
  const start = Math.min(Math.max(activeIndex - Math.floor(WINDOW / 2), 0), total - count)

  // Hold + drag left/right scrubs through reels; a tap without dragging jumps to that dot
  const dotHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      scrub.current = { x: e.clientX, index: activeIndex, moved: false }
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = scrub.current
      if (!s) return
      const dx = e.clientX - s.x
      if (Math.abs(dx) > 6) s.moved = true
      if (s.moved) onSelect(clamp(s.index + Math.round(dx / SCRUB_PX)))
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = scrub.current
      scrub.current = null
      if (!s || s.moved) return
      // Captured pointer: find the dot under the finger by position
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-dot]')
      if (hit) onSelect(Number(hit.dataset.dot))
    },
    onPointerCancel: () => { scrub.current = null },
  }

  const navButton = (step: 1 | -1) => (
    <button
      onClick={() => onNavigate(step)}
      disabled={step === -1 ? activeIndex === 0 : activeIndex === total - 1}
      className={`flex items-center gap-1.5 text-xs font-medium transition-opacity disabled:opacity-25 ${step === 1 ? 'flex-row-reverse' : ''} text-primary`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d={step === -1 ? 'M18 15L12 9L6 15' : 'M6 9L12 15L18 9'} />
      </svg>
      {step === -1 ? 'Prev' : 'Next'}
    </button>
  )

  return (
    <div
      className="flex-shrink-0"
      style={{
        borderTop: '1px solid hsl(var(--border))',
        backgroundColor: 'rgba(5,2,6,0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between px-8 py-2">
        {navButton(-1)}
        <div
          {...dotHandlers}
          role="slider"
          aria-label="Reel"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={activeIndex + 1}
          className="flex items-center gap-1.5 px-3 py-3 -my-2 touch-none select-none cursor-grab active:cursor-grabbing"
        >
          {Array.from({ length: count }, (_, k) => {
            const i = start + k
            const isActive = i === activeIndex
            // Shrink the end dots when more reels lie beyond the window
            const isEdge = (k === 0 && start > 0) || (k === count - 1 && start + count < total)
            return (
              <div
                key={i}
                data-dot={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 18 : isEdge ? 3 : 4,
                  height: isEdge && !isActive ? 3 : 4,
                  backgroundColor: isActive ? 'hsl(var(--primary))' : 'rgba(59,59,59,0.8)',
                }}
              />
            )
          })}
        </div>
        {navButton(1)}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  categories: string[]
  active: string
  onSelect: (category: string) => void
}

// Same ")" semicircle as the explore ScrollDots, but each dot is a category.
// Collapsed it's a small arc docked to the side; open it grows and labels fan out.
// When there are more categories than fit, the open arc scrolls like a wheel:
// items travel along the curve and fade out past the ends.
const PAD = 12
const R_COLLAPSED = 44
const R_EXPANDED_MAX = 190
const MIN_GAP = 56 // px along the arc between open labels; sets how many fit
const COLLAPSED_SLOTS = 9
const LABEL_H = 28 // tap-target height of each expanded label
const CX = PAD // circle centre on the left edge, so only the right half shows
export const ARC_STRIP_WIDTH = R_COLLAPSED + PAD * 2 + 8
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

export default function CategoryArc({ categories, active, onSelect }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const [open, setOpen] = useState(false)
  const [scroll, setScroll] = useState(0) // index of the category in the first open slot (fractional while moving)
  const drag = useRef<{ y: number; scroll: number; moved: boolean } | null>(null)
  const snapTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Fit the arc to the available height
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const n = categories.length
  const activeIndex = Math.max(categories.indexOf(active), 0)
  const cy = height / 2
  const maxR = Math.max((height - PAD * 4) / 2, 0)
  const rOpen = Math.min(R_EXPANDED_MAX, maxR)
  const openSlots = clamp(Math.floor((Math.PI * rOpen) / MIN_GAP) + 1, 2, n)
  const maxScroll = Math.max(n - openSlots, 0)

  const r = open ? rOpen : Math.min(R_COLLAPSED, maxR)
  const slots = open ? openSlots : Math.min(n, COLLAPSED_SLOTS)
  // Collapsed always centres the window on the active category
  const offset = open ? scroll : clamp(activeIndex - Math.floor(slots / 2), 0, n - slots)

  // Position + visibility of item i on the arc for the current scroll offset
  const place = (i: number) => {
    const p = i - offset // 0 … slots-1 when on the arc
    const t = slots === 1 ? 0.5 : p / (slots - 1)
    const theta = (clamp(-90 + 180 * t, -100, 100) * Math.PI) / 180
    // Fade the end slots when more items are hidden beyond them, and anything off the arc
    const lo = offset > 0.01 ? 0.75 : 0
    const hi = offset < n - slots - 0.01 ? slots - 1.75 : slots - 1
    const opacity = clamp(1 - Math.max(lo - p, p - hi, 0) / 1.2, 0, 1)
    return { x: CX + r * Math.cos(theta), y: cy + r * Math.sin(theta), opacity }
  }

  const scrollTo = (v: number, snap: boolean) => {
    setScroll(clamp(snap ? Math.round(v) : v, 0, maxScroll))
    clearTimeout(snapTimer.current)
    if (!snap) snapTimer.current = setTimeout(() => setScroll(s => Math.round(s)), 160)
  }

  const openArc = () => {
    setScroll(clamp(activeIndex - Math.floor(openSlots / 2), 0, maxScroll))
    setOpen(true)
  }
  const select = (cat: string) => {
    onSelect(cat)
    setOpen(false)
  }

  // Scroll / drag handlers (open state only). A drag suppresses the click that follows.
  const scrollHandlers = {
    onWheel: (e: React.WheelEvent) => scrollTo(scroll + e.deltaY / 50, false),
    onPointerDown: (e: React.PointerEvent) => {
      drag.current = { y: e.clientY, scroll, moved: false }
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current
      if (!d || e.buttons !== 1) return
      const dy = e.clientY - d.y
      if (Math.abs(dy) > 6) d.moved = true
      if (d.moved) scrollTo(d.scroll - dy / (MIN_GAP * 0.8), false)
    },
    onPointerUp: () => {
      if (drag.current?.moved) scrollTo(scroll, true)
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (drag.current?.moved) e.stopPropagation()
      drag.current = null
    },
    // Taps on empty space (not a dot/label) close it, same as the backdrop
    onClick: (e: React.MouseEvent) => e.target === e.currentTarget && setOpen(false),
  }

  return (
    <div ref={rootRef} className="absolute inset-y-0 left-0" style={{ width: ARC_STRIP_WIDTH }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ backgroundColor: 'rgba(5,2,6,0.7)', backdropFilter: 'blur(3px)' }}
            onClick={() => setOpen(false)}
            onWheel={scrollHandlers.onWheel}
          />
        )}
      </AnimatePresence>

      {height > 0 && (
        <div
          className={`absolute inset-y-0 left-0 z-40 select-none ${open ? 'touch-none' : ''}`}
          // Open: widen the hit area to cover the arc + labels so drags anywhere on it scroll
          style={{ width: open ? rOpen + PAD + 180 : '100%' }}
          {...(open ? scrollHandlers : {})}
        >
          {/* Arc track */}
          <svg className="absolute inset-0 overflow-visible pointer-events-none" width="100%" height="100%">
            <motion.path
              initial={false}
              animate={{ d: `M ${CX} ${cy - r} A ${r} ${r} 0 0 1 ${CX} ${cy + r}` }}
              transition={SPRING}
              fill="none"
              stroke="rgba(251,255,244,0.12)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>

          {/* Dots + labels */}
          {categories.map((cat, i) => {
            const { x, y, opacity } = place(i)
            const isActive = cat === active
            const size = isActive ? 12 : open ? 8 : 5
            const hidden = opacity < 0.05
            return (
              <div key={cat}>
                <motion.button
                  initial={false}
                  animate={{ x: x - size / 2, y: y - size / 2, width: size, height: size, opacity }}
                  transition={SPRING}
                  onClick={() => select(cat)}
                  tabIndex={open && !hidden ? 0 : -1}
                  aria-label={cat}
                  className={`absolute left-0 top-0 rounded-full ${open && !hidden ? '' : 'pointer-events-none'}`}
                  style={{
                    backgroundColor: isActive ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.25)',
                    boxShadow: isActive ? '0 0 10px rgba(154,129,116,0.6)' : 'none',
                  }}
                />
                <AnimatePresence>
                  {open && (
                    <motion.button
                      initial={{ opacity: 0, x: x + 6, y: y - LABEL_H / 2 }}
                      animate={{ opacity, x: x + 16, y: y - LABEL_H / 2 }}
                      exit={{ opacity: 0, x: x + 6, transition: { duration: 0.12 } }}
                      transition={SPRING}
                      onClick={() => select(cat)}
                      tabIndex={hidden ? -1 : 0}
                      className={`absolute left-0 top-0 flex items-center whitespace-nowrap text-xs font-semibold tracking-widest uppercase pr-3 ${hidden ? 'pointer-events-none' : ''}`}
                      style={{ height: LABEL_H, color: isActive ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.6)' }}
                    >
                      {cat}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

          {/* Collapsed: the whole arc is one button that opens it, with the active
              category written vertically in the hollow */}
          {!open && (
            <button
              onClick={openArc}
              aria-label={`Choose category (current: ${active})`}
              aria-expanded={false}
              className="absolute left-0 cursor-pointer"
              style={{ top: cy - r - PAD, width: r + PAD * 2, height: (r + PAD) * 2 }}
            >
              <span
                className="absolute text-[9px] font-semibold tracking-widest uppercase whitespace-nowrap"
                style={{
                  left: CX + r * 0.45,
                  top: '50%',
                  transform: 'translate(-50%, -50%) rotate(-90deg)',
                  color: 'hsl(var(--primary))',
                }}
              >
                {active}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleSaved, useStore } from '@/components/account/store'
import { BOOKMARK_PATH } from '@/components/layouts/icons'

const FAN_DIST = 72 // px from the main button's centre
const FAN_SPREAD = 45 // degrees between neighbouring fan items
const SIZE = 56 // main button
const ITEM = 40 // fan item
const EDGE = 8 // min gap between a fan item and the screen edge
// `slot` is the item's place in the fan: 0 = centre, -1/1 = either side
const FAN_ACTIONS = [
  { label: 'Link Listing', slot: 0, icon: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71' },
  { label: 'Share', slot: -1, icon: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6L12 2 8 6M12 2v13' },
  { label: 'Save', slot: 1, icon: BOOKMARK_PATH },
]

type Offset = { x: number; y: number }

/**
 * Fan points from the button toward the screen centre, so it opens into the page
 * wherever the button sits (bottom-right on explore, top-right on browse), then each
 * item is clamped inside the viewport.
 */
function fanOffsets(el: HTMLElement): Offset[] {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const base = Math.atan2(window.innerHeight / 2 - cy, window.innerWidth / 2 - cx)
  const min = EDGE + ITEM / 2
  return FAN_ACTIONS.map(({ slot }) => {
    const theta = base + (slot * FAN_SPREAD * Math.PI) / 180
    const clampAxis = (v: number, c: number, max: number) => Math.min(Math.max(v, min - c), max - min - c)
    return {
      x: clampAxis(FAN_DIST * Math.cos(theta), cx, window.innerWidth),
      y: clampAxis(FAN_DIST * Math.sin(theta), cy, window.innerHeight),
    }
  })
}

type FanItemProps = (typeof FAN_ACTIONS)[number] & Offset & { index: number; onClick?: () => void; active?: boolean }

function FanItem({ label, icon, index, x, y, onClick, active }: FanItemProps) {
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
      animate={{ x, y, opacity: 1, scale: 1 }}
      exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: index * 0.04 }}
      className="absolute"
      // Centred on the main button; x/y move it out along the fan
      style={{ left: (SIZE - ITEM) / 2, top: (SIZE - ITEM) / 2 }}
    >
      <button
        onClick={onClick}
        aria-pressed={active}
        className="group relative flex items-center justify-center rounded-full transition-all duration-150"
        style={{
          width: ITEM,
          height: ITEM,
          backgroundColor: 'hsl(var(--secondary))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}
      >
        {/* Label tooltip */}
        <span
          className="absolute right-12 whitespace-nowrap text-[10px] font-semibold tracking-wide px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'rgba(251,255,244,0.7)',
          }}
        >
          {label}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? 'hsl(var(--primary))' : 'none'} stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round">
          <path d={icon} />
        </svg>
      </button>
    </motion.div>
  )
}

/** `reelId`: the reel the fan acts on (Explore's active reel). Without it, Save is inactive. */
export default function TWButton({ reelId }: { reelId?: string }) {
  const savedIds = useStore()?.saved
  const isSaved = !!reelId && !!savedIds?.includes(reelId)
  const rootRef = useRef<HTMLDivElement>(null)
  const lastPointer = useRef('mouse')
  const [offsets, setOffsets] = useState<Offset[] | null>(null) // null = closed
  const expanded = offsets !== null

  const open = () => rootRef.current && setOffsets(fanOffsets(rootRef.current))
  const close = () => setOffsets(null)

  // Touch: tapping anywhere else closes the fan
  useEffect(() => {
    if (!expanded) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOffsets(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [expanded])

  return (
    <div
      ref={rootRef}
      className="relative z-50"
      style={{ width: SIZE, height: SIZE }}
      // Mouse opens on hover; touch/pen toggle on tap (a tap's emulated hover is ignored)
      onPointerEnter={e => e.pointerType === 'mouse' && open()}
      onPointerLeave={e => e.pointerType === 'mouse' && close()}
      onPointerDown={e => { lastPointer.current = e.pointerType }}
    >
      {/* Invisible hover bridge so the mouse can cross the gap to the fan items */}
      {expanded && (
        <div
          className="absolute rounded-full"
          style={{ inset: -(FAN_DIST + ITEM / 2 - SIZE / 2) }}
        />
      )}

      {/* Fan items */}
      <AnimatePresence>
        {offsets?.map((o, i) => (
          <FanItem
            key={FAN_ACTIONS[i].label}
            {...FAN_ACTIONS[i]}
            {...o}
            index={i}
            // TODO: Link Listing / Share not wired yet
            {...(FAN_ACTIONS[i].label === 'Save' && reelId && { onClick: () => toggleSaved(reelId), active: isSaved })}
          />
        ))}
      </AnimatePresence>

      {/* Main TW button */}
      <button
        onClick={e => {
          // Hover already handles the mouse; keyboard clicks (detail 0) still toggle
          if (e.detail !== 0 && lastPointer.current === 'mouse') return
          if (expanded) close(); else open()
        }}
        className="absolute inset-0 rounded-full flex items-center justify-center font-bold transition-all duration-200"
        style={{
          backgroundColor: expanded ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
          border: `1.5px solid ${expanded ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
          color: expanded ? 'hsl(var(--background))' : 'hsl(var(--foreground))',
          boxShadow: expanded ? '0 0 24px rgba(154,129,116,0.3)' : '0 4px 16px rgba(0,0,0,0.5)',
          fontSize: 13,
          letterSpacing: '0.05em',
        }}
      >
        TW
        <motion.div
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'hsl(var(--primary))', opacity: expanded ? 0 : 0.7 }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--background))" strokeWidth="3" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.div>
      </button>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { applySortFilter, matchesQuery, similarReels } from './data'
import ReelCard, { CARD_HEIGHT, type ReelCardProps } from './ReelCard'
import MobileReelInfo from './MobileReelInfo'
import DetailPanel from './DetailPanel'
import ScrollDots from './ScrollDots'
import SortFilterButton from './SortFilterButton'
import type { Reel, SortValue } from './types'
import TWButton from './TWButton'
import MobileNav from './MobileNav'
import PageHeader, { modCount } from '@/components/layouts/PageHeader'
import SearchToggle from '@/components/layouts/SearchToggle'

// Wheel geometry — arc curves to the left as items move away from active center
const WHEEL_RADIUS = 700 // px; larger = flatter arc, smaller = tighter spiral
const ANGLE_STEP = 13 // degrees between adjacent items on the wheel
const SPRING = { type: 'spring', stiffness: 290, damping: 34 } as const

function wheelTransform(offset: number) {
  const rad = (offset * ANGLE_STEP * Math.PI) / 180
  const d = Math.abs(offset)
  return {
    x: WHEEL_RADIUS * (Math.cos(rad) - 1), // always ≤ 0: cards arc left
    y: WHEEL_RADIUS * Math.sin(rad),
    scale: Math.max(0.38, 1 - d * 0.17),
    opacity: Math.max(0.07, 1 - d * 0.28),
  }
}

// Mobile: TikTok-style paging — one full-height reel, neighbours parked just off-screen
const stackTransform = (cardHeight: number) => (offset: number) =>
  ({ x: 0, y: offset * (cardHeight + 16), scale: 1, opacity: 1 })

interface Props {
  /**
   * Reel to open on. Without `source` it's shown first with similar reels lined up
   * after it (from browse); with `source` the wheel starts at it within that list.
   */
  initialId?: string
  /** Fixed reel list to scroll through instead of all reels (e.g. the Saved tab) */
  source?: Reel[]
  /** Header title */
  title?: string
  /** Shows an icon-only back button before the title (e.g. the Saved viewer → /saved) */
  backHref?: string
}

export default function ExplorePage({ initialId, source: sourceProp, title = 'Explore', backHref }: Props) {
  // Snapshot so the list doesn't shift if a reel is unsaved while viewing it
  const [source] = useState(sourceProp)
  // Cleared once the user applies their own sort/filter
  const [seedId, setSeedId] = useState(source ? undefined : initialId)
  // Index + last travel direction (1 = forward/down, -1 = back/up), kept together so
  // the detail panel can slide the same way the reel moved
  const [{ index: activeIndex, dir }, setNav] = useState<{ index: number; dir: 1 | -1 }>(() => ({
    index: Math.max(source?.findIndex(r => r.id === initialId) ?? 0, 0),
    dir: 1,
  }))
  const setActiveIndex = useCallback((next: number | ((prev: number) => number)) => {
    setNav(prev => {
      const index = typeof next === 'function' ? next(prev.index) : next
      return index === prev.index ? prev : { index, dir: index > prev.index ? 1 : -1 }
    })
  }, [])
  const [sort, setSort] = useState<SortValue>('newest')
  const [selectedCats, setSelectedCats] = useState<string[]>([]) // empty = All
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  // Desktop and mobile layouts are both mounted (one hidden via CSS), so each needs its own ref
  const desktopReelRef = useRef<HTMLDivElement>(null)
  const mobileReelRef = useRef<HTMLDivElement>(null)
  const scrollCooldown = useRef(false)
  // Mobile card = largest 9:16 frame that fits the reel area (like the TikTok app)
  const [mobileCard, setMobileCard] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    const el = mobileReelRef.current
    if (!el) return
    const ro = new ResizeObserver(([{ contentRect: r }]) => {
      const h = Math.min(r.height - 24, ((r.width - 24) * 16) / 9)
      setMobileCard(h > 0 ? { w: (h * 9) / 16, h } : null)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const reels = useMemo(() => {
    const list = seedId ? similarReels(seedId) : applySortFilter(sort, selectedCats, source)
    const q = query.trim().toLowerCase()
    return q ? list.filter(r => matchesQuery(r, q)) : list
  }, [seedId, sort, selectedCats, source, query])
  // With a fixed source, only offer categories present in it
  const categories = useMemo(() => source && ['All', ...new Set(source.map(r => r.category))], [source])
  const activeReel = reels[activeIndex]

  const navigate = useCallback((step: 1 | -1) => {
    if (scrollCooldown.current) return
    scrollCooldown.current = true
    setTimeout(() => { scrollCooldown.current = false }, 620)
    setActiveIndex(prev => Math.min(Math.max(prev + step, 0), reels.length - 1))
  }, [reels.length, setActiveIndex])

  // Wheel, touch-swipe and arrow-key navigation
  useEffect(() => {
    let touchStartY: number | null = null
    const controller = new AbortController()
    const { signal } = controller
    const onWheel = (e: WheelEvent) => { e.preventDefault(); navigate(e.deltaY > 0 ? 1 : -1) }
    // Swipes that start in scrollable reel details shouldn't change reels
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = (e.target as Element).closest('[data-no-swipe]') ? null : e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null) return
      const delta = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(delta) > 40) navigate(delta > 0 ? 1 : -1)
      touchStartY = null
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      navigate(e.key === 'ArrowDown' ? 1 : -1)
    }

    for (const el of [desktopReelRef.current, mobileReelRef.current]) {
      el?.addEventListener('wheel', onWheel, { passive: false, signal })
      el?.addEventListener('touchstart', onTouchStart, { passive: true, signal })
      el?.addEventListener('touchend', onTouchEnd, { passive: true, signal })
    }
    window.addEventListener('keydown', onKey, { signal })
    return () => controller.abort()
  }, [navigate])

  const renderCards = (
    range: number,
    transform: typeof wheelTransform,
    cardProps?: (reel: Reel, isActive: boolean) => Partial<ReelCardProps>,
  ) =>
    reels.map((reel, i) => {
      const offset = i - activeIndex
      if (Math.abs(offset) > range) return null
      return (
        <motion.div
          key={reel.id}
          style={{ position: 'absolute', zIndex: 20 - Math.abs(offset) }}
          animate={transform(offset)}
          transition={SPRING}
          onClick={() => setActiveIndex(i)}
          className={offset !== 0 ? 'cursor-pointer' : undefined}
        >
          <ReelCard reel={reel} isActive={offset === 0} {...cardProps?.(reel, offset === 0)} />
        </motion.div>
      )
    })

  const filterButton = (
    <SortFilterButton
      sort={sort}
      selected={selectedCats}
      categories={categories}
      onApply={(nextSort, nextCats) => {
        setSeedId(undefined)
        setSort(nextSort)
        setSelectedCats(nextCats)
        setActiveIndex(0)
      }}
      iconOnly={searchOpen}
    />
  )


  return (
    <div className="absolute inset-0 overflow-hidden bg-background flex flex-col">

      <PageHeader title={title} subtitle={modCount(reels.length)} backHref={backHref}>
        <div className="flex items-center gap-2">
          {filterButton}
          <SearchToggle
            open={searchOpen}
            onOpenChange={setSearchOpen}
            value={query}
            // New results: start the wheel at the first match
            onChange={q => { setQuery(q); setActiveIndex(0) }}
          />
        </div>
      </PageHeader>

      {/* ── DESKTOP LAYOUT ───────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 overflow-hidden relative">

        <div className="flex-shrink-0 flex items-center pl-6 pr-2">
          <ScrollDots total={reels.length} active={activeIndex} onSelect={setActiveIndex} />
        </div>

        {/* Reel wheel */}
        <div
          ref={desktopReelRef}
          className="relative flex-1 flex items-center justify-center overflow-hidden cursor-ns-resize select-none"
        >
          <div
            className="absolute left-6 bottom-8 z-20 flex flex-col gap-1 pointer-events-none text-[9px]"
            style={{ color: 'rgba(251,255,244,0.12)' }}
          >
            <span className="font-semibold tracking-widest uppercase">Scroll</span>
            <span>↑ ↓</span>
          </div>
          {/* Active reel plays its video in the wheel */}
          {renderCards(4, wheelTransform, (_, isActive) => ({ video: isActive }))}
        </div>

        {/* Detail panel — fixed to the active card's height; both are vertically centred, so edges align */}
        <div className="flex-shrink-0 flex flex-col justify-center w-[420px] pr-10 pl-6">
          {/* White card: full details (price on seller posts); the video plays in the reel */}
          <div className="flex flex-col rounded-2xl p-6 bg-white shadow-2xl" style={{ height: CARD_HEIGHT }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-5 text-neutral-400">
              Modification Detail
            </p>
            <div className="flex-1 min-h-0 overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                {activeReel && <DetailPanel key={activeReel.id} reel={activeReel} direction={dir} />}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 z-50"><TWButton reelId={activeReel?.id} /></div>
      </div>

      {/* ── MOBILE LAYOUT ────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        <div ref={mobileReelRef} className="relative flex-1 flex items-center justify-center overflow-hidden select-none">
          {/* Title + tap-to-expand details live on the active reel itself; video plays in it */}
          {mobileCard &&
            renderCards(1, stackTransform(mobileCard.h), (reel, isActive) => ({
              width: mobileCard.w,
              height: mobileCard.h,
              video: isActive,
              overlay: isActive ? <MobileReelInfo reel={reel} /> : undefined,
            }))}
        </div>

        <MobileNav activeIndex={activeIndex} total={reels.length} onNavigate={navigate} onSelect={setActiveIndex} />
      </div>
    </div>
  )
}

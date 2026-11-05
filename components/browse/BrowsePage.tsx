'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { applySortFilter, CATEGORIES, matchesQuery, MOCK_REELS, reelsByIds } from '@/components/explore/data'
import { useStore } from '@/components/account/store'
import type { SortValue } from '@/components/explore/types'
import SortFilterButton from '@/components/explore/SortFilterButton'
import TWButton from '@/components/explore/TWButton'
import BrowseCard from './BrowseCard'
import CategoryArc, { ARC_STRIP_WIDTH } from './CategoryArc'
import PageHeader, { modCount } from '@/components/layouts/PageHeader'
import SearchToggle from '@/components/layouts/SearchToggle'

/* Cart button — placeholder */
function CartButton() {
  return (
    <button
      className="flex items-center justify-center rounded-full transition-all duration-200 hover:opacity-80"
      style={{
        width: 40,
        height: 40,
        backgroundColor: 'rgba(59,59,59,0.3)',
        border: '1px solid hsl(var(--border))',
        color: 'rgba(251,255,244,0.55)',
      }}
      aria-label="Cart"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    </button>
  )
}

// Saved in landscape has no tab bar or back button, so its arc is the page nav instead
const SAVED_ARC_NAV: Record<string, string> = {
  All: '/browse',
  Explore: '/explore',
  Saved: '/saved',
  Profile: '/profile',
}

/** `saved` = the Saved tab: same layout, but only the user's saved reels, each with Buy now */
export default function BrowsePage({ saved = false }: { saved?: boolean }) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sort, setSort] = useState<SortValue>('newest')
  const [picked, setPicked] = useState<string[]>([]) // selected categories; empty = All
  const router = useRouter()
  const savedIds = useStore()?.saved

  // Saved: reels in saved order (most recent first), categories limited to what's saved
  const source = useMemo(
    () => (saved ? reelsByIds(savedIds ?? []) : MOCK_REELS),
    [saved, savedIds],
  )
  const categories = useMemo(
    () => (saved ? ['All', ...new Set(source.map(r => r.category))] : CATEGORIES),
    [saved, source],
  )
  // Drop any selected category whose last saved reel was unsaved
  const selected = useMemo(() => picked.filter(c => categories.includes(c)), [picked, categories])
  const reels = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = applySortFilter(sort, selected, source)
    return q ? list.filter(r => matchesQuery(r, q)) : list
  }, [sort, selected, source, query])
  // The arc picks one at a time: show the single pick, "All", or a count when several are on
  const arcActive = selected.length === 1 ? selected[0] : selected.length ? `${selected.length} selected` : 'All'
  const gridRef = useRef<HTMLDivElement>(null)

  const selectCategory = (cat: string) => {
    setPicked(cat === 'All' ? [] : [cat])
    gridRef.current?.scrollTo({ top: 0 })
  }

  return (
    <div className="absolute inset-0 bg-background flex flex-col overflow-hidden">

      {/* z-10: header popovers above the grid, under the category arc's z-30 backdrop */}
      <PageHeader
        title={saved ? 'Saved' : 'Browse'}
        subtitle={`${modCount(reels.length)}${selected.length ? ` · ${selected.join(', ')}` : ''}`}
        z="z-10"
      >
        <div className="flex items-center gap-2">
          <SortFilterButton
            sort={sort}
            selected={selected}
            categories={categories}
            onApply={(s, c) => { setSort(s); setPicked(c) }}
            iconOnly={searchOpen}
          />
          <SearchToggle open={searchOpen} onOpenChange={setSearchOpen} value={query} onChange={setQuery} />
          <CartButton />
          <TWButton />
        </div>
      </PageHeader>

      <main className="flex-1 min-h-0 flex">
        {/* Landscape only: semicircle docked to the left — categories on Browse, page nav on Saved */}
        <div className="hidden landscape:block relative flex-shrink-0" style={{ width: ARC_STRIP_WIDTH }}>
          {saved ? (
            <CategoryArc
              categories={Object.keys(SAVED_ARC_NAV)}
              active="Saved"
              onSelect={label => label !== 'Saved' && router.push(SAVED_ARC_NAV[label])}
            />
          ) : (
            <CategoryArc categories={categories} active={arcActive} onSelect={selectCategory} />
          )}
        </div>

        {/* ── GRID ───────────────────────────────────────────────────── */}
        {/* isolate: keeps the cards' own z-indexes (link layers) inside the grid */}
        <div ref={gridRef} className="flex-1 overflow-y-auto isolate">
          <div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 p-4 pb-12 gap-3"
          >
            {reels.map(reel => (
              <BrowseCard
                key={reel.id}
                reel={reel}
                buyNow={saved}
                // Saved reels open in the explore view under /saved, so the Saved tab stays active
                href={saved ? `/saved/${encodeURIComponent(reel.id)}` : undefined}
              />
            ))}
          </div>

          {query.trim() && source.length > 0 && reels.length === 0 && (
            <p className="pt-24 text-center text-sm px-6" style={{ color: 'rgba(251,255,244,0.35)' }}>
              No mods match “{query.trim()}”.
            </p>
          )}

          {/* savedIds is undefined until hydrated, so this doesn't flash on load */}
          {saved && savedIds?.length === 0 && (
            <div className="flex flex-col items-center gap-3 pt-24 text-center px-6">
              <p className="text-sm" style={{ color: 'rgba(251,255,244,0.35)' }}>No saved mods yet.</p>
              <p className="text-xs" style={{ color: 'rgba(251,255,244,0.25)' }}>
                Tap Save on any reel in Explore and it will show up here.
              </p>
              <Link
                href="/explore"
                className="text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-80 bg-primary text-background"
              >
                Go to Explore
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

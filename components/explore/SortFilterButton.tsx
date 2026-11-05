'use client'

import { useState, useEffect, useRef } from 'react'
import { CATEGORIES } from './data'
import type { SortValue } from './types'

interface Props {
  sort: SortValue
  /** Selected categories; empty = All */
  selected: string[]
  /** Category chips to offer; defaults to every category */
  categories?: string[]
  onApply: (sort: SortValue, selected: string[]) => void
  /** Icon only (label + chevron hidden) — used while search is open */
  iconOnly?: boolean
}

/* Simplified sportbike silhouette SVG */
function MotoIcon() {
  return (
    <svg width="28" height="18" viewBox="0 0 56 34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Rear wheel */}
      <circle cx="11" cy="24" r="9" />
      {/* Front wheel */}
      <circle cx="45" cy="24" r="9" />
      {/* Frame / swingarm */}
      <path d="M11 24 L16 12 L30 9 L42 15 L45 24" />
      {/* Fairing / tank top */}
      <path d="M16 12 Q22 4 30 9 Q36 6 42 15" />
      {/* Handlebar / fork */}
      <path d="M40 15 L46 8 M44 10 L49 12" />
      {/* Rider silhouette (minimal) */}
      <path d="M25 9 Q23 4 27 3 Q30 2 30 6 L29 9" />
    </svg>
  )
}

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
]

export default function SortFilterButton({ sort, selected, categories = CATEGORIES, onApply, iconOnly }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isFiltered = sort !== 'newest' || selected.length > 0

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Sort and filter"
        aria-expanded={open}
        className={`flex items-center gap-2 h-10 ${iconOnly ? 'px-3' : 'px-4'} rounded-full transition-all duration-200`}
        style={{
          backgroundColor: open ? 'hsl(var(--secondary))' : 'rgba(59,59,59,0.3)',
          border: `1px solid ${open ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
          color: open ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.55)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <MotoIcon />
        {!iconOnly && <span className="text-xs font-semibold tracking-wider uppercase">Sort / Filter</span>}
        {isFiltered && (
          <span
            aria-label="Filters active"
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          />
        )}
        {!iconOnly && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9L12 15L18 9" />
          </svg>
        )}
      </button>

      {/* Dropdown — mounts fresh on each open so the draft starts from the applied values */}
      {open && (
        <FilterMenu
          initialSort={sort}
          initialSelected={selected}
          categories={categories}
          onApply={(s, c) => {
            onApply(s, c)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}

interface MenuProps {
  initialSort: SortValue
  initialSelected: string[]
  categories: string[]
  onApply: (sort: SortValue, selected: string[]) => void
}

function FilterMenu({ initialSort, initialSelected, categories, onApply }: MenuProps) {
  const [activeSort, setActiveSort] = useState<SortValue>(initialSort)
  const [picked, setPicked] = useState(initialSelected)
  // Multi-select: chips toggle; "All" clears the selection (and is lit when nothing is picked)
  const toggle = (cat: string) =>
    setPicked(p => (cat === 'All' ? [] : p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat]))
  const isOn = (cat: string) => (cat === 'All' ? picked.length === 0 : picked.includes(cat))

  return (
    <div
      className="absolute right-0 top-12 rounded-xl overflow-hidden z-50"
      style={{
        width: 280,
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Sort section */}
      <div className="p-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(251,255,244,0.35)' }}>
          Sort By
        </p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setActiveSort(opt.value)}
              className="flex items-center justify-between h-8 px-3 rounded-lg text-sm transition-all duration-150"
              style={{
                backgroundColor: activeSort === opt.value ? 'rgba(154,129,116,0.12)' : 'transparent',
                color: activeSort === opt.value ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.55)',
              }}
            >
              {opt.label}
              {activeSort === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12L10 17L19 8" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category section */}
      <div className="p-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(251,255,244,0.35)' }}>
          Category <span className="normal-case tracking-normal font-normal" style={{ color: 'rgba(251,255,244,0.25)' }}>· pick any</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              aria-pressed={isOn(cat)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-all duration-150"
              style={{
                backgroundColor:
                  isOn(cat) ? 'hsl(var(--primary))' : 'rgba(59,59,59,0.4)',
                border: `1px solid ${isOn(cat) ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                color: isOn(cat) ? 'hsl(var(--background))' : 'rgba(251,255,244,0.5)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Apply */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onApply(activeSort, picked)}
          className="w-full h-9 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all hover:opacity-90 bg-primary text-background"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}

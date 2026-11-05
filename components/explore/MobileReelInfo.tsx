'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Reel } from './types'
import { toggleSaved, useStore } from '@/components/account/store'
import { BOOKMARK_PATH, VerifiedIcon } from '@/components/layouts/icons'
import { sellerHref } from '@/components/sellers/data'
import { MuteButton } from './ReelVideo'
import { listingHref } from './data'

const chip = (bg: string, border: string, color: string) => ({ backgroundColor: bg, border: `1px solid ${border}`, color })

/**
 * Mobile: the reel's own title block is the toggle — poster's handle, then the title.
 * Tapped, the details expand over the reel (transparent, the reel is the background).
 * No price on reels.
 */
export default function MobileReelInfo({ reel }: { reel: Reel }) {
  const [open, setOpen] = useState(false)
  const saved = !!useStore()?.saved.includes(reel.id)
  // Customer posts show the buyer who posted; seller posts show the seller
  const poster = reel.author ?? reel.seller

  return (
    <div
      // pointer-events-none: taps on the gradient reach the video; only the content is interactive
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4 pt-16 pointer-events-none"
      // Gradient only for legibility — the reel shows through as the background
      style={{
        background: open
          ? 'linear-gradient(to top, rgba(5,2,6,0.92) 0%, rgba(5,2,6,0.7) 55%, transparent 100%)'
          : 'linear-gradient(to top, rgba(5,2,6,0.85) 0%, transparent 100%)',
        transition: 'background 0.3s ease',
      }}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden pointer-events-auto"
          >
            {/* data-no-swipe: scrolling the details shouldn't flip to the next reel */}
            <div data-no-swipe className="max-h-[50vh] overflow-y-auto flex flex-col gap-3 pb-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded" style={chip('rgba(154,129,116,0.18)', 'rgba(154,129,116,0.35)', 'hsl(var(--primary))')}>
                  {reel.modification}
                </span>
                <span className="text-[10px] font-medium tracking-widest uppercase px-2 py-1 rounded" style={chip('rgba(5,2,6,0.4)', 'rgba(251,255,244,0.15)', 'rgba(251,255,244,0.6)')}>
                  {reel.category}
                </span>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'rgba(251,255,244,0.75)' }}>{reel.description}</p>

              {reel.author && (
                <span className="text-[10px] font-medium tracking-widest uppercase -mb-1.5" style={{ color: 'rgba(251,255,244,0.45)' }}>
                  Fitted by
                </span>
              )}
              <Link href={sellerHref(reel.seller.handle)} className="flex items-center gap-2.5 self-start">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'rgba(59,59,59,0.6)', color: 'hsl(var(--primary))' }}
                >
                  {reel.seller.name.charAt(0)}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {reel.seller.name}
                  {reel.seller.verified && <VerifiedIcon size={13} />}
                </span>
              </Link>

              <div className="flex flex-wrap gap-1.5">
                {reel.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded" style={chip('rgba(5,2,6,0.35)', 'rgba(251,255,244,0.12)', 'rgba(251,255,244,0.55)')}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Opens the listing on the fitting seller's profile (price, bikes, variations) */}
              <Link
                href={listingHref(reel)}
                className="h-10 rounded-lg font-semibold text-sm flex items-center justify-center active:scale-[0.98] transition-transform bg-primary text-background"
              >
                View Listing
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title bar: the toggle, plus sound (video reels only) and Save */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-end gap-2 text-left"
        >
          <span className="min-w-0 flex flex-col">
            <span className="text-sm font-semibold leading-tight truncate" style={{ color: 'rgba(251,255,244,0.75)' }}>
              {poster.handle}
            </span>
            <span className="text-base font-semibold text-foreground leading-tight line-clamp-2">{reel.title}</span>
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className={`flex-shrink-0 mb-0.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            style={{ color: 'rgba(251,255,244,0.6)' }}
            aria-hidden
          >
            <path d="M18 15L12 9L6 15" />
          </svg>
        </button>
        <MuteButton />
        <button
          onClick={() => toggleSaved(reel.id)}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          aria-pressed={saved}
          className="p-1 flex-shrink-0 transition-transform active:scale-90"
          style={{ color: saved ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.7)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d={BOOKMARK_PATH} />
          </svg>
        </button>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import type { Reel } from '@/components/explore/types'
import { formatPrice } from '@/components/explore/data'

interface Props {
  reel: Reel
  /** Saved tab: floating Buy now button on the card corner */
  buyNow?: boolean
  /** Where the card opens; defaults to explore with similar reels after this one */
  href?: string
}

export default function BrowseCard({ reel, buyNow = false, href }: Props) {
  return (
    <div className="group relative">
      {/* Stretched link: the whole card opens explore on this reel with similar reels
          lined up after it. Sibling (not parent) of the seller link — <a> can't nest. */}
      <Link
        href={href ?? `/explore?id=${encodeURIComponent(reel.id)}`}
        aria-label={reel.title}
        className="absolute inset-0 z-20 rounded-xl"
      />
      {/* Card image area */}
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          aspectRatio: '3 / 5',
          background: reel.thumbnailUrl
            ? `url(${reel.thumbnailUrl}) center/cover`
            : `linear-gradient(160deg, ${reel.bgGradient[0]}, ${reel.bgGradient[1]})`,
          border: '1px solid hsl(var(--border))',
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 19px,hsl(var(--border)) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,hsl(var(--border)) 20px)',
          }}
        />

        {/* Category badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className="text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'rgba(154,129,116,0.18)',
              border: '1px solid rgba(154,129,116,0.3)',
              color: 'hsl(var(--primary))',
            }}
          >
            {reel.category}
          </span>
        </div>

        {/* Customer posts are showcases — nothing to buy */}
        {buyNow && !reel.author && (
          // TODO: checkout not wired yet. z-30 keeps it above the card's stretched link.
          <button
            aria-label={`Buy ${reel.title}`}
            className="absolute bottom-2 right-2 z-30 flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-semibold tracking-wide uppercase shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--background))', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            Buy now
          </button>
        )}

        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="flex items-center justify-center rounded-full opacity-50 group-hover:opacity-90 transition-opacity duration-200"
            style={{
              width: 36,
              height: 36,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(251,255,244,0.9)">
              <path d="M7 4.5L19.5 12L7 19.5V4.5Z" />
            </svg>
          </div>
        </div>

        {/* Hover overlay — title + price */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 p-2.5 ${buyNow ? 'pr-24' : ''} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          style={{ background: 'linear-gradient(to top, rgba(5,2,6,0.95) 0%, transparent 100%)' }}
        >
          <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-1">
            {reel.title}
          </p>
          {reel.price != null && (
            <p className="text-[9px] mt-0.5 text-primary">
            {formatPrice(reel)}
          </p>
          )}
        </div>

        {/* Hover ring */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(154,129,116,0.5)' }}
        />
      </div>

    </div>
  )
}

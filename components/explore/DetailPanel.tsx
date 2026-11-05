'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import type { Reel } from './types'
import { toggleSaved, useStore } from '@/components/account/store'
import { BOOKMARK_PATH, VerifiedIcon } from '@/components/layouts/icons'
import { posterHref, sellerHref } from '@/components/sellers/data'
import { formatPrice, listingHref } from './data'

interface Props {
  reel: Reel
  /** 1 = moved to next reel (enter from below), -1 = previous (enter from above) */
  direction?: 1 | -1
}

const SLIDE = 24 // px

// `custom` comes from AnimatePresence, so the exiting panel uses the latest direction
const slideVariants: Variants = {
  enter: (dir: 1 | -1) => ({ opacity: 0, y: dir * SLIDE }),
  center: { opacity: 1, y: 0 },
  exit: (dir: 1 | -1) => ({ opacity: 0, y: -dir * SLIDE }),
}

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">{children}</p>
)
const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(item => (
      <span key={item} className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-600">
        {item}
      </span>
    ))}
  </div>
)

/**
 * Desktop / landscape details (white card beside the reel wheel; the video plays in the reel).
 * Seller posts: full details incl. price, bikes and variations.
 * Customer posts: no price — "View listing" opens the tagged seller's listing.
 */
export default function DetailPanel({ reel, direction = 1 }: Props) {
  const saved = !!useStore()?.saved.includes(reel.id)
  const isCustomer = !!reel.author

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-4 h-full overflow-y-auto pr-1 text-neutral-900"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded bg-[rgba(154,129,116,0.14)] border border-[rgba(154,129,116,0.35)] text-[#7a6356]">
          {reel.modification}
        </span>
        <span className="text-[10px] font-medium tracking-widest uppercase px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-neutral-500">
          {reel.category}
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold leading-tight">{reel.title}</h2>
        {isCustomer && (
          <Link href={posterHref(reel)} className="mt-1 inline-block text-xs text-neutral-500 hover:underline underline-offset-2">
            Posted by {reel.author!.handle}
          </Link>
        )}
      </div>

      <p className="text-sm leading-relaxed text-neutral-600">{reel.description}</p>

      <div className="h-px bg-neutral-200" />

      {!isCustomer && (
        <>
          <div className="flex items-baseline gap-2">
            <Label>Price</Label>
            <span className="text-xl font-bold">{formatPrice(reel)}</span>
          </div>
          {!!reel.compatibleBikes?.length && (
            <div className="flex flex-col gap-1.5">
              <Label>Fits</Label>
              <Chips items={reel.compatibleBikes} />
            </div>
          )}
          {!!reel.variations?.length && (
            <div className="flex flex-col gap-1.5">
              <Label>Variations</Label>
              <Chips items={reel.variations} />
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-1.5">
        {isCustomer && <Label>Fitted by</Label>}
        <Link href={sellerHref(reel.seller.handle)} className="flex items-center gap-3 group self-start">
          <span className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 border border-neutral-200 text-xs font-bold text-[#7a6356]">
            {reel.seller.name.charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-medium group-hover:underline underline-offset-2">
              {reel.seller.name}
              {reel.seller.verified && <VerifiedIcon size={14} />}
            </span>
            <span className="block text-xs text-neutral-500">{reel.seller.handle}</span>
          </span>
        </Link>
      </div>

      <Chips items={reel.tags} />

      <div className="flex gap-3 mt-auto pt-2">
        <Link
          href={listingHref(reel)}
          className="flex-1 h-11 rounded-lg font-semibold text-sm flex items-center justify-center transition-opacity hover:opacity-90 bg-primary text-background"
        >
          View listing
        </Link>
        <button
          onClick={() => toggleSaved(reel.id)}
          aria-pressed={saved}
          className={`h-11 px-4 rounded-lg text-sm font-medium flex items-center gap-1.5 border transition-colors ${
            saved ? 'border-[#9a8174] text-[#7a6356]' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d={BOOKMARK_PATH} />
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </motion.div>
  )
}

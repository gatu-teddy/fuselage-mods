'use client'

import type { ReactNode } from 'react'
import type { Reel } from '@/components/explore/types'
import { formatPrice } from '@/components/explore/data'
import { toggleSaved, useStore } from '@/components/account/store'
import { BOOKMARK_PATH, VerifiedIcon } from '@/components/layouts/icons'
import type { SellerProfile } from './data'

interface Props {
  /** The reel that was opened — plays as the background (a buyer's reel stays a buyer's reel) */
  shown: Reel
  /** The seller's listing behind it: price, bikes, variations. Missing if a buyer post isn't linked. */
  listing?: Reel
  seller: SellerProfile
}

const Section = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(251,255,244,0.5)' }}>{label}</p>
    {children}
  </div>
)
const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(item => (
      <span key={item} className="text-[11px] font-medium px-2 py-0.5 rounded"
        style={{ backgroundColor: 'rgba(5,2,6,0.45)', border: '1px solid rgba(251,255,244,0.18)', color: 'rgba(251,255,244,0.8)' }}>
        {item}
      </span>
    ))}
  </div>
)

/**
 * Top of a listing page: the opened reel as the background, the seller's listing over it.
 * Always names the fitting seller (never the buyer who posted the reel).
 */
export default function ListingHero({ shown, listing, seller }: Props) {
  const saved = !!useStore()?.saved.includes(listing?.id ?? '')
  const item = listing ?? shown

  return (
    <section className="relative min-h-[72vh] flex flex-col justify-end overflow-hidden">
      {/* Background: the reel */}
      {shown.videoUrl ? (
        <video src={shown.videoUrl} poster={shown.thumbnailUrl} autoPlay muted loop playsInline
          aria-hidden className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{
          background: shown.thumbnailUrl
            ? `url(${shown.thumbnailUrl}) center/cover`
            : `linear-gradient(160deg, ${shown.bgGradient[0]}, ${shown.bgGradient[1]})`,
        }} />
      )}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(5,2,6,0.96) 0%, rgba(5,2,6,0.75) 45%, rgba(5,2,6,0.2) 100%)',
      }} />

      <div className="relative flex flex-col gap-4 p-5 pt-24 max-w-2xl">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded"
            style={{ backgroundColor: 'rgba(154,129,116,0.2)', border: '1px solid rgba(154,129,116,0.4)', color: 'hsl(var(--primary))' }}>
            {item.modification}
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase px-2 py-1 rounded"
            style={{ backgroundColor: 'rgba(5,2,6,0.45)', border: '1px solid rgba(251,255,244,0.15)', color: 'rgba(251,255,244,0.65)' }}>
            {item.category}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">{item.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: 'rgba(251,255,244,0.7)' }}>
            by {seller.name}
            {seller.verified && <VerifiedIcon size={13} />}
          </p>
        </div>

        {listing ? (
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(251,255,244,0.5)' }}>Price</span>
            <span className="text-2xl font-bold text-foreground">{formatPrice(listing)}</span>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'rgba(251,255,244,0.6)' }}>
            Not listed yet — message {seller.name} for a price.
          </p>
        )}

        {!!listing?.compatibleBikes?.length && <Section label="Fits"><Chips items={listing.compatibleBikes} /></Section>}
        {!!listing?.variations?.length && <Section label="Variations"><Chips items={listing.variations} /></Section>}

        <p className="text-sm leading-relaxed" style={{ color: 'rgba(251,255,244,0.75)' }}>{item.description}</p>

        <div className="flex gap-2.5">
          {/* TODO: checkout + messaging not wired yet */}
          {listing && (
            <button className="flex-1 h-11 rounded-lg font-semibold text-sm bg-primary text-background">
              Buy now
            </button>
          )}
          <button className="flex-1 h-11 rounded-lg font-medium text-sm"
            style={{ border: '1px solid rgba(251,255,244,0.25)', color: 'rgba(251,255,244,0.85)', backgroundColor: 'rgba(5,2,6,0.35)' }}>
            Message seller
          </button>
          {listing && (
            <button onClick={() => toggleSaved(listing.id)} aria-label={saved ? 'Remove from saved' : 'Save'} aria-pressed={saved}
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ border: '1px solid rgba(251,255,244,0.25)', color: saved ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.85)', backgroundColor: 'rgba(5,2,6,0.35)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d={BOOKMARK_PATH} />
              </svg>
            </button>
          )}
        </div>

        <p className="text-[10px] tracking-widest uppercase text-center pt-2" style={{ color: 'rgba(251,255,244,0.35)' }}>
          More from {seller.name} ↓
        </p>
      </div>
    </section>
  )
}

'use client'

import { useMemo, type ReactNode } from 'react'
import { getSellerReels, getSellerTags, type SellerProfile } from './data'
import ProfileView, { StarRating } from './ProfileView'

interface Props {
  seller: SellerProfile
  /** Listing details shown above the profile (listing pages) */
  top?: ReactNode
  backHref?: string
}

export default function SellerPage({ seller, top, backHref }: Props) {
  const reels = useMemo(() => getSellerReels(seller.handle), [seller.handle])

  return (
    <ProfileView
      {...seller}
      top={top}
      backHref={backHref}
      stats={[
        { label: 'Mods', value: reels.length },
        { label: 'Tags', value: getSellerTags(seller.handle) },
        { label: 'Sales', value: seller.totalSales },
        ...(seller.rating != null ? [{ label: 'Rating', value: <StarRating rating={seller.rating} /> }] : []),
      ]}
      actions={
        <>
          {/* TODO: Follow / Message not wired yet */}
          <button
            className="text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80 active:scale-[0.97] bg-primary text-background"
          >
            Follow
          </button>
          <button
            className="flex items-center justify-center rounded-lg transition-all duration-200 hover:opacity-70"
            style={{ width: 34, height: 34, border: '1px solid hsl(var(--border))', color: 'rgba(251,255,244,0.45)' }}
            aria-label="Message seller"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </>
      }
      reels={reels}
    />
  )
}

'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Reel } from '@/components/explore/types'
import BrowseCard from '@/components/browse/BrowseCard'
import { BackIcon, TikTokIcon, VerifiedIcon } from '@/components/layouts/icons'
import { modCount } from '@/components/layouts/PageHeader'

// Shared layout for seller pages, buyer pages, listings and the user's own profile.
// Callers supply the stats, the action buttons and (optionally) a custom bio area.
// The whole page scrolls as one, so a listing (`top`) can sit above the profile + posts.

interface Stat {
  label: string
  value: ReactNode
}

interface Props {
  name: string
  handle: string // no @
  location: string
  verified?: boolean
  bgGradient: [string, string]
  /** Rendered as the bio; pass a node to make it editable */
  bio: ReactNode
  stats: Stat[]
  actions: ReactNode
  instagram?: string
  tiktok?: string
  specialties?: string[]
  reels: Reel[]
  /** Shown above the profile, e.g. a listing's details */
  top?: ReactNode
  /** Fixed Back destination; otherwise Back goes to the previous page */
  backHref?: string
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? 'hsl(var(--primary))' : 'none'}
          stroke="hsl(var(--primary))"
          strokeWidth="1.8"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs ml-0.5 font-semibold text-primary">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

const divider = <div className="h-6 w-px" style={{ backgroundColor: 'hsl(var(--border))' }} />

const INSTAGRAM_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)
const TIKTOK_ICON = <TikTokIcon size={15} />

export default function ProfileView(p: Props) {
  const router = useRouter()
  const social: [href: string, label: string, icon: ReactNode][] = []
  if (p.instagram) social.push([p.instagram, 'Instagram', INSTAGRAM_ICON])
  if (p.tiktok) social.push([p.tiktok, 'TikTok', TIKTOK_ICON])

  return (
    <div className="absolute inset-0 bg-background flex flex-col overflow-hidden">

      {/* ── BANNER — height = Back button + padding only ─────────────── */}
      <div
        className="flex-shrink-0 relative px-4 py-2.5"
        style={{ background: `linear-gradient(160deg, ${p.bgGradient[0]}, ${p.bgGradient[1]})` }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 19px,hsl(var(--border)) 20px),' +
              'repeating-linear-gradient(90deg,transparent,transparent 19px,hsl(var(--border)) 20px)',
          }}
        />
        <button
          onClick={() => {
            if (p.backHref) router.push(p.backHref)
            // Opened directly (new tab / shared link) there's no history to go back to
            else if (window.history.length > 1) router.back()
            else router.push('/browse')
          }}
          className="relative flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: 'rgba(251,255,244,0.5)' }}
        >
          <BackIcon />
          Back
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {p.top}

        {/* ── PROFILE ────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 pb-5 border-b border-border">
          <div className="flex items-end justify-between mt-4">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                backgroundColor: 'hsl(var(--secondary))',
                border: '2.5px solid hsl(var(--background))',
              }}
            >
              <span className="text-lg font-bold text-primary">
                {p.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 pb-1">{p.actions}</div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground">{p.name}</h1>
            {p.verified && (
              <VerifiedIcon size={15} />
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(251,255,244,0.35)' }}>
            @{p.handle}
            {p.location && ` · ${p.location}`}
          </p>

          <div className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(251,255,244,0.55)', maxWidth: 540 }}>
            {p.bio}
          </div>

          {/* stats */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-4">
            {p.stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-5">
                {i > 0 && divider}
                <div>
                  <div className="text-base font-bold text-foreground">{s.value}</div>
                  <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: 'rgba(251,255,244,0.3)' }}>
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
            {social.length > 0 && (
              <>
                {divider}
                <div className="flex items-center gap-3">
                  {social.map(([href, label, icon]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="transition-opacity hover:opacity-80"
                      style={{ color: 'rgba(251,255,244,0.4)' }}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          {!!p.specialties?.length && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {p.specialties.map(s => (
                <span
                  key={s}
                  className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'rgba(154,129,116,0.1)',
                    border: '1px solid rgba(154,129,116,0.25)',
                    color: 'hsl(var(--primary))',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── POSTS GRID ─────────────────────────────────────────────── */}
        <div>
          {p.reels.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: 'rgba(251,255,244,0.2)' }}>No mods listed yet.</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(251,255,244,0.05)' }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(251,255,244,0.2)' }}>
                  {modCount(p.reels.length)}
                </p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-4 pb-12">
                {p.reels.map(reel => (
                  <BrowseCard key={reel.id} reel={reel} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

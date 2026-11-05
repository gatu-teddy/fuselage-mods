'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useStore } from './store'
import { reelsByIds } from '@/components/explore/data'
import ExplorePage from '@/components/explore/ExplorePage'

/** Explore-style viewer over the user's saved reels, starting at `id` */
export default function SavedExplore({ id }: { id: string }) {
  const savedIds = useStore()?.saved
  const reels = useMemo(() => savedIds && reelsByIds(savedIds), [savedIds])

  if (!reels) return null // wait for hydration so the wheel starts at the right reel
  if (reels.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background">
        <p className="text-sm" style={{ color: 'rgba(251,255,244,0.35)' }}>No saved mods yet.</p>
        <Link href="/saved" className="text-xs font-semibold hover:opacity-80 text-primary">
          Back to Saved
        </Link>
      </div>
    )
  }
  return <ExplorePage source={reels} initialId={id} title="Saved" backHref="/saved" />
}

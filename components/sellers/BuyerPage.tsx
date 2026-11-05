'use client'

import type { Reel } from '@/components/explore/types'
import type { BuyerProfile } from './data'
import ProfileView from './ProfileView'

/** Public page for a buyer: profile + the mods they've posted. No listing details or prices. */
export default function BuyerPage({ buyer, posts }: { buyer: BuyerProfile; posts: Reel[] }) {
  return (
    <ProfileView
      {...buyer}
      stats={[{ label: 'Posts', value: posts.length }]}
      actions={null}
      reels={posts}
      backHref="/explore"
    />
  )
}

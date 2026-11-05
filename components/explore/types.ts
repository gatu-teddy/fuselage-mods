export type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'popular'

export interface Seller {
  name: string
  handle: string
  verified: boolean
}

export interface Reel {
  id: string
  title: string
  modification: string
  description: string
  /** Seller posts only — customer posts are showcases with no price */
  price?: number
  currency: string
  seller: Seller
  category: string
  tags: string[]
  bgGradient: [string, string]
  /** Uploaded video file (Cloudflare R2) */
  videoUrl?: string
  /** Poster frame shown before/without playback */
  thumbnailUrl?: string
  /** Customer posts: who posted it (seller = who fitted it). Omitted on seller posts. */
  author?: { name: string; handle: string }
  /** Customer posts: the seller listing this mod came from (its price, bikes, variations) */
  listingId?: string
  /** Bikes the mod fits */
  compatibleBikes?: string[]
  /** Free-text list of possible variations (finish, size, setup…) */
  variations?: string[]
}

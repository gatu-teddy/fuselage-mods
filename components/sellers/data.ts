import type { Reel } from '@/components/explore/types'
import { MOCK_REELS } from '@/components/explore/data'

export interface SellerProfile {
  name: string
  handle: string           // URL-safe, no @  e.g. "moto_nbi"
  verified: boolean
  bio: string
  location: string
  instagram?: string
  tiktok?: string
  rating?: number // undefined until the seller has reviews
  totalSales: number
  specialties: string[]
  bgGradient: [string, string]
}

export const MOCK_SELLERS: SellerProfile[] = [
  {
    name: 'Moto Workshop NBI',
    handle: 'moto_nbi',
    verified: true,
    bio: 'Performance workshop specialising in exhaust systems, suspension builds, and full track conversions. 8 years fitting factory-grade parts.',
    location: 'Nairobi, KE',
    instagram: 'https://instagram.com/moto_nbi',
    tiktok: 'https://tiktok.com/@moto_nbi',
    rating: 4.9,
    totalSales: 143,
    specialties: ['Exhaust', 'Suspension', 'Wheels'],
    bgGradient: ['#1a0800', '#2e1200'],
  },
  {
    name: 'Circuit Garage KE',
    handle: 'circuit_ke',
    verified: false,
    bio: 'Electronics and lighting specialists. Custom LED builds, quickshifter installs, ECU flashing. Operating across Dubai and Nairobi.',
    location: 'Dubai, UAE',
    instagram: 'https://instagram.com/circuit_ke',
    tiktok: 'https://tiktok.com/@circuit_ke',
    rating: 4.5,
    totalSales: 67,
    specialties: ['Electronics', 'Lighting'],
    bgGradient: ['#00001a', '#0a001a'],
  },
  {
    name: 'Apex Motorsport',
    handle: 'apex_ke',
    verified: true,
    bio: 'Track-focused retailer. Brembo, Öhlins, SC-Project, Gilles. We stock what we sell and fit what we stock.',
    location: 'Dubai, UAE',
    instagram: 'https://instagram.com/apex_ke',
    tiktok: 'https://tiktok.com/@apex_ke',
    rating: 4.8,
    totalSales: 221,
    specialties: ['Brakes', 'Suspension', 'Controls', 'Exhaust'],
    bgGradient: ['#1a0000', '#2d0505'],
  },
  {
    name: 'Carbon Works EA',
    handle: 'carbonworks_ea',
    verified: false,
    bio: 'Dry carbon fairings, tank shrouds, and belly pans. Hand-laid in our workshop. OEM fitment guaranteed.',
    location: 'Mombasa, KE',
    instagram: 'https://instagram.com/carbonworks_ea',
    rating: 4.3,
    totalSales: 29,
    specialties: ['Fairings'],
    bgGradient: ['#0a0a0a', '#151515'],
  },
  {
    name: 'Rift Valley Moto',
    handle: 'riftmoto',
    verified: false,
    bio: 'Tyres, crash protection, and touring gear. Stocking Pirelli, R&G, Oxford. Fast fitment, honest advice.',
    location: 'Nakuru, KE',
    instagram: 'https://instagram.com/riftmoto',
    rating: 4.4,
    totalSales: 54,
    specialties: ['Tyres', 'Protection'],
    bgGradient: ['#001010', '#002020'],
  },
  {
    name: 'Stitch & Throttle',
    handle: 'stitchthrottle',
    verified: true,
    bio: 'Custom upholstery and livery wraps. Alcantara, leather, full-body vinyl. If you can imagine it, we can wrap or stitch it.',
    location: 'Dubai, UAE',
    instagram: 'https://instagram.com/stitchthrottle',
    tiktok: 'https://tiktok.com/@stitchthrottle',
    rating: 4.7,
    totalSales: 88,
    specialties: ['Seats', 'Graphics'],
    bgGradient: ['#1a001a', '#100010'],
  },
]

/** Seller page URL from a reel's seller handle ("@moto_nbi" → /sellers/moto_nbi) */
export const sellerHref = (handle: string) => `/sellers/${handle.replace('@', '')}`

export function getSellerByHandle(handle: string): SellerProfile | undefined {
  return MOCK_SELLERS.find(s => s.handle === handle)
}

/** The seller's own posts (customer posts tagging them live in the feeds, not here) */
export function getSellerReels(handle: string): Reel[] {
  return MOCK_REELS.filter(r => !r.author && r.seller.handle === `@${handle}`)
}

/** "Tags": live customer posts tagging this seller — the seller's version of followers */
export const getSellerTags = (handle: string) =>
  MOCK_REELS.filter(r => r.author && r.seller.handle === `@${handle}`).length

// ── Buyers (public pages for people who post mods but don't sell) ─────────────
export interface BuyerProfile {
  name: string
  handle: string // URL-safe, no @
  bio: string
  location: string
  bgGradient: [string, string]
}

export const MOCK_BUYERS: BuyerProfile[] = [
  {
    name: 'Kamau Mwangi',
    handle: 'kamau_rides',
    bio: 'Weekend canyon carver. GSX-R1000, slowly getting louder.',
    location: 'Nairobi, KE',
    bgGradient: ['#140a00', '#2a1400'],
  },
  {
    name: 'Aisha Al Mansoori',
    handle: 'aisha.moto',
    bio: 'Track days at Yas Marina. ZX-10R.',
    location: 'Dubai, UAE',
    bgGradient: ['#0f0a14', '#1e1228'],
  },
]

export const getBuyerByHandle = (handle: string) => MOCK_BUYERS.find(b => b.handle === handle)

/** Posts a buyer made */
export const getBuyerPosts = (handle: string) => MOCK_REELS.filter(r => r.author?.handle === `@${handle}`)

/** Public page for whoever posted a reel: buyer page for customer posts, seller page otherwise */
export const posterHref = (reel: Reel) =>
  reel.author ? `/users/${reel.author.handle.replace('@', '')}` : sellerHref(reel.seller.handle)

import { createClient } from '@/lib/supabase/server'
import { getBuyerByHandle, getSellerByHandle, type BuyerProfile, type SellerProfile } from './data'

// Public profile lookups for server pages: mock data first, then real accounts in Supabase.

const DEFAULT_GRADIENT: [string, string] = ['#1a0a00', '#2e1200']
const gradient = (g: string[] | null) => (g?.length === 2 ? (g as [string, string]) : DEFAULT_GRADIENT)

/** Supabase server client, or null when env vars aren't configured */
async function db() {
  try {
    return await createClient()
  } catch {
    return null
  }
}

export async function findSeller(handle: string): Promise<SellerProfile | undefined> {
  const mock = getSellerByHandle(handle)
  if (mock) return mock
  const { data } = (await (await db())?.from('sellers')
    .select('handle, display_name, bio, location, instagram, tiktok, verified, total_sales, rating, specialties, bg_gradient')
    .eq('handle', handle)
    .maybeSingle()) ?? { data: null }
  if (!data) return undefined
  return {
    name: data.display_name,
    handle: data.handle,
    verified: !!data.verified,
    bio: data.bio ?? '',
    location: data.location ?? '',
    instagram: data.instagram ?? undefined, // optional socials: hidden when missing
    tiktok: data.tiktok ?? undefined,
    rating: data.rating ?? undefined,
    totalSales: data.total_sales ?? 0,
    specialties: data.specialties ?? [],
    bgGradient: gradient(data.bg_gradient),
  }
}

export async function findBuyer(handle: string): Promise<BuyerProfile | undefined> {
  const mock = getBuyerByHandle(handle)
  if (mock) return mock
  const { data } = (await (await db())?.from('profiles')
    .select('handle, display_name, bio, location')
    .eq('handle', handle)
    .maybeSingle()) ?? { data: null }
  if (!data?.handle) return undefined
  return {
    name: data.display_name ?? data.handle,
    handle: data.handle,
    bio: data.bio ?? '',
    location: data.location ?? '',
    bgGradient: DEFAULT_GRADIENT,
  }
}

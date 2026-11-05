import type { Metadata } from 'next'
import ExplorePage from '@/components/explore/ExplorePage'

export const metadata: Metadata = {
  title: 'Explore Modifications — Fuselage',
  description: 'Discover sportbike modifications from verified sellers in Kenya and across East Africa.',
}

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { id } = await searchParams
  // Keyed so going from /explore?id=… to /explore (or another id) starts fresh
  return <ExplorePage key={id ?? 'all'} initialId={id} />
}

import type { Metadata } from 'next'
import SavedExplore from '@/components/account/SavedExplore'

export const metadata: Metadata = { title: 'Saved — Fuselage' }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Keyed so opening a different saved reel starts the wheel there
  return <SavedExplore key={id} id={id} />
}

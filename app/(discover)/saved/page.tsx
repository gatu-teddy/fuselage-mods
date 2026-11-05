import type { Metadata } from 'next'
import BrowsePage from '@/components/browse/BrowsePage'

export const metadata: Metadata = { title: 'Saved — Fuselage' }

export default function Page() {
  return <BrowsePage saved />
}

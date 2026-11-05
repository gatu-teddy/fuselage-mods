import type { Metadata } from 'next'
import BrowsePage from '@/components/browse/BrowsePage'

export const metadata: Metadata = {
  title: 'Browse Modifications — Fuselage',
  description: 'Browse sportbike modifications from verified sellers across East Africa.',
}

export default function Page() {
  return <BrowsePage />
}

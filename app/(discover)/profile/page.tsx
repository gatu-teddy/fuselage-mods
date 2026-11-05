import type { Metadata } from 'next'
import ProfilePage from '@/components/account/ProfilePage'

export const metadata: Metadata = { title: 'Profile — Fuselage' }

export default function Page() {
  return <ProfilePage />
}

import type { Metadata } from 'next'
import SellerOnboarding from '@/components/account/SellerOnboarding'

export const metadata: Metadata = { title: 'Become a seller — Fuselage' }

// /seller/* requires sign-in (proxy.ts redirects to /sign-in?next=… otherwise)
export default function Page() {
  return <SellerOnboarding />
}

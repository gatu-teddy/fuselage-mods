'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BOOKMARK_PATH } from './icons'

// Each icon is one stroke path (circles written as arcs) so a single <TabIcon> draws them all
export const NAV_ITEMS = [
  { label: 'Explore', href: '/explore', icon: 'M19 11a8 8 0 11-16 0 8 8 0 0116 0zM21 21l-4.35-4.35' },
  { label: 'Browse', href: '/browse', icon: 'M3 6h18M3 12h18M3 18h18' },
  { label: 'Saved', href: '/saved', icon: BOOKMARK_PATH },
  { label: 'Profile', href: '/profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
]

export function TabIcon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d={d} />
    </svg>
  )
}

/** Mobile bottom tab bar — rendered by the (discover) layout so it persists across pages */
export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden flex-shrink-0 flex items-center justify-around px-2 pt-2"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        borderTop: '1px solid hsl(var(--border))',
        backgroundColor: 'rgba(5,2,6,0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-150"
            style={{ color: active ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.3)' }}
          >
            <TabIcon d={item.icon} />
            <span className="text-[9px] font-semibold tracking-wider uppercase">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

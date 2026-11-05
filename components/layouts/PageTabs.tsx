'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, TabIcon } from './TabBar'

/**
 * Wide layouts (landscape / desktop) hide the bottom tab bar, so the same tabs sit
 * permanently in a row just below the page header, with the active page highlighted.
 */
export default function PageTabs() {
  const pathname = usePathname()

  return (
    <nav aria-label="Pages" className="hidden md:flex flex-shrink-0 justify-center pt-3">
      <div
        className="flex items-center gap-1 p-1 rounded-full"
        style={{
          backgroundColor: 'rgba(5,2,6,0.92)',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}
      >
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
              style={{
                color: active ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.45)',
                backgroundColor: active ? 'rgba(154,129,116,0.12)' : 'transparent',
              }}
            >
              <TabIcon d={item.icon} size={16} />
              <span className="text-[10px] font-semibold tracking-wider uppercase">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

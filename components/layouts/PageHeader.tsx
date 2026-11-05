import Link from 'next/link'
import type { ReactNode } from 'react'
import HoverTabs from './HoverTabs'
import { BackIcon } from './icons'

interface Props {
  title: string
  subtitle: ReactNode
  /** Icon-only back button before the title */
  backHref?: string
  /** Stacking level: lifts header popovers (filter, TW fan, page tabs) above page content */
  z?: 'z-10' | 'z-50'
  /** Right-hand controls */
  children?: ReactNode
}

/** Shared page header. Shown in every layout, with the page tabs on its divider in wide ones. */
export default function PageHeader({ title, subtitle, backHref, z = 'z-50', children }: Props) {
  return (
    <header
      className={`relative ${z} flex items-center justify-between gap-3 px-4 md:px-6 py-3 flex-shrink-0 border-b border-border`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="flex items-center justify-center w-8 h-8 -ml-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ color: 'rgba(251,255,244,0.6)' }}
          >
            <BackIcon size={18} />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xs font-semibold tracking-widest uppercase text-primary">
            {title}
          </h1>
          <p className="text-[10px] truncate" style={{ color: 'rgba(251,255,244,0.3)' }}>{subtitle}</p>
        </div>
      </div>
      {children}
      {/* Wide layouts have no tab bar: page tabs appear from the divider on hover/tap */}
      <HoverTabs />
    </header>
  )
}

export const modCount = (n: number) => `${n} ${n === 1 ? 'modification' : 'modifications'}`

import Link from 'next/link'
import type { ReactNode } from 'react'
import PageTabs from './PageTabs'
import { BackIcon } from './icons'

interface Props {
  title: string
  subtitle: ReactNode
  /** Icon-only back button before the title */
  backHref?: string
  /** Stacking level: lifts header popovers (filter, TW fan) above page content */
  z?: 'z-10' | 'z-50'
  /** Right-hand controls */
  children?: ReactNode
}

/** Placeholder for the TrueWagon logo icon until the real mark is ready */
function LogoMark() {
  return (
    <Link
      href="/"
      aria-label="TrueWagon home"
      className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold tracking-wider transition-opacity hover:opacity-80 text-primary"
      style={{ backgroundColor: 'rgba(154,129,116,0.12)', border: '1px solid rgba(154,129,116,0.35)' }}
    >
      TW
    </Link>
  )
}

/**
 * Shared page header. Mobile: page title + subtitle. Wide layouts: the logo mark
 * instead (the always-visible page tabs below show which page is active).
 */
export default function PageHeader({ title, subtitle, backHref, z = 'z-50', children }: Props) {
  return (
    <>
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
          <LogoMark />
          <div className="min-w-0">
            {/* Still the page heading for screen readers in wide layouts */}
            <h1 className="text-xs font-semibold tracking-widest uppercase text-primary md:sr-only">
              {title}
            </h1>
            <p className="text-[10px] truncate md:hidden" style={{ color: 'rgba(251,255,244,0.3)' }}>{subtitle}</p>
          </div>
        </div>
        {children}
      </header>
      <PageTabs />
    </>
  )
}

export const modCount = (n: number) => `${n} ${n === 1 ? 'modification' : 'modifications'}`

import Link from 'next/link'

const linkClass = 'underline-offset-2 hover:underline transition-colors hover:text-foreground'

/** The footer text + links. Contact / Terms pages come in a later sprint. */
export function FooterContent({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] ${className}`}
      style={{ color: 'rgba(251,255,244,0.35)' }}
    >
      <p>TrueWagon is a registered product of Galco LLC.</p>
      <nav className="flex items-center gap-3">
        <Link href="/contact" className={linkClass}>Contact us</Link>
        <span aria-hidden>·</span>
        <Link href="/terms" className={linkClass}>Terms &amp; Conditions</Link>
      </nav>
    </div>
  )
}

/** Wide layouts (landscape / desktop): always-visible footer below the page */
export function SiteFooter() {
  return (
    <footer
      className="hidden md:block flex-shrink-0 px-6 py-3"
      style={{ backgroundColor: 'rgba(5,2,6,0.95)', borderTop: '1px solid hsl(var(--border))' }}
    >
      <FooterContent className="md:justify-between" />
    </footer>
  )
}

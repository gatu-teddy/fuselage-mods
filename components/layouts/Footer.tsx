'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from './useReveal'

const linkClass = 'underline-offset-2 hover:underline transition-colors hover:text-foreground'

/** The footer text + links. Contact / Terms pages come in a later sprint. */
export function FooterContent({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] ${className}`}
      style={{ color: 'rgba(251,255,244,0.35)' }}
    >
      <p>Fuselage is a registered product of Galco LLC.</p>
      <nav className="flex items-center gap-3">
        <Link href="/contact" className={linkClass}>Contact us</Link>
        <span aria-hidden>·</span>
        <Link href="/terms" className={linkClass}>Terms and Conditions</Link>
      </nav>
    </div>
  )
}

/**
 * Wide layouts (landscape / desktop): the page itself doesn't scroll (only the reels
 * do), so the footer stays hidden and slides up when you hover the bottom edge.
 * Touch: tap the handle. Render inside a `relative` container.
 */
export function HoverFooter() {
  const { rootRef, open, setOpen, hoverProps } = useReveal<HTMLDivElement>()

  return (
    <div ref={rootRef} className="hidden md:block absolute left-0 right-0 bottom-0 z-50" {...hoverProps}>
      {/* Bottom-edge hover strip + handle (tap target on touch) */}
      <div className="h-4 flex items-end justify-center">
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Hide footer' : 'Show footer'}
          aria-expanded={open}
          className="px-6 pt-2 pb-1.5"
        >
          <span className="block w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(251,255,244,0.18)' }} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.footer
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            className="absolute left-0 right-0 bottom-0 px-6 py-3"
            style={{
              backgroundColor: 'rgba(5,2,6,0.95)',
              borderTop: '1px solid hsl(var(--border))',
              backdropFilter: 'blur(12px)',
            }}
          >
            <FooterContent className="md:justify-between" />
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  )
}

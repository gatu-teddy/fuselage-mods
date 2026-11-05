'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_ITEMS, TabIcon } from './TabBar'
import { useReveal } from './useReveal'

/**
 * Wide layouts (landscape / desktop) hide the bottom tab bar, so this puts the same
 * tabs on the header's bottom divider. Mouse: hover the divider to reveal them.
 * Touch (no hover): tap the handle to toggle; tapping elsewhere closes.
 * Render inside a `relative` header.
 */
export default function HoverTabs() {
  const pathname = usePathname()
  const { rootRef, open, setOpen, hoverProps } = useReveal<HTMLDivElement>()

  return (
    <div
      ref={rootRef}
      // Thin full-width strip straddling the divider is the hover target
      className="hidden md:block absolute left-0 right-0 top-full -translate-y-1/2 h-4 z-50"
      {...hoverProps}
    >
      {/* Handle on the divider — visible hint, and the tap target on touch */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Hide pages' : 'Show pages'}
        aria-expanded={open}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2"
      >
        <span
          className="block w-10 h-1 rounded-full transition-colors"
          style={{ backgroundColor: open ? 'hsl(var(--primary))' : 'rgba(251,255,244,0.18)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          // Centred by a static flex row: framer's y animation owns `transform`, so a
          // translate-x class on the nav itself would be overridden. pointer-events-none
          // keeps the full-width row from widening the hover area.
          <motion.div
            key="tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full flex justify-center pointer-events-none"
          >
            <motion.nav
              initial={{ y: -6 }}
              animate={{ y: 0 }}
              exit={{ y: -6 }}
              transition={{ duration: 0.15 }}
              // pt keeps the gap inside the hover area so moving down to the tabs doesn't close them
              className="pt-1.5 pointer-events-auto"
            >
              <div
                className="flex items-center gap-1 p-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(5,2,6,0.92)',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
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
                      onClick={() => setOpen(false)}
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
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

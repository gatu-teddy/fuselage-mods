'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Show/hide state for hover-revealed UI (page tabs, footer) in wide layouts.
 * Mouse: hover the root to show, leave to hide (with a short grace period).
 * Touch has no hover, so callers also give it a tap toggle; tapping outside closes.
 */
export function useReveal<T extends HTMLElement>() {
  const rootRef = useRef<T>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const hoverProps = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      clearTimeout(closeTimer.current)
      setOpen(true)
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') closeTimer.current = setTimeout(() => setOpen(false), 200)
    },
  }

  return { rootRef, open, setOpen, hoverProps }
}

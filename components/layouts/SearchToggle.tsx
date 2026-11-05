'use client'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (value: string) => void
}

const SEARCH_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <path d="M19 11a8 8 0 11-16 0 8 8 0 0116 0zM21 21l-4.35-4.35" />
  </svg>
)

const shell = { backgroundColor: 'rgba(59,59,59,0.3)', border: '1px solid hsl(var(--border))', color: 'rgba(251,255,244,0.55)' }

/**
 * Search that sits beside Sort / Filter: an icon by default, a field when open.
 * The parent shrinks Sort / Filter to its icon while this is open.
 */
export default function SearchToggle({ open, onOpenChange, value, onChange }: Props) {
  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        aria-label="Search mods"
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
        style={shell}
      >
        {SEARCH_ICON}
      </button>
    )
  }

  const close = () => { onChange(''); onOpenChange(false) }

  return (
    <label className="relative flex items-center h-10 w-40 sm:w-56 rounded-full focus-within:border-primary" style={shell}>
      <span className="absolute left-3 pointer-events-none">{SEARCH_ICON}</span>
      <input
        autoFocus
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        // Tapping away with nothing typed folds it back to the icon
        onBlur={() => { if (!value.trim()) onOpenChange(false) }}
        onKeyDown={e => e.key === 'Escape' && close()}
        placeholder="Search mods"
        aria-label="Search mods"
        className="w-full h-full bg-transparent outline-none pl-9 pr-8 text-xs text-foreground placeholder:text-[rgba(251,255,244,0.35)] [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        // onMouseDown so it runs before the input's blur
        onMouseDown={e => { e.preventDefault(); close() }}
        aria-label="Close search"
        className="absolute right-2 p-1"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </label>
  )
}

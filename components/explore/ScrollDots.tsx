'use client'

interface Props {
  total: number
  active: number
  onSelect: (i: number) => void
}

// Semicircle geometry — dots run top → bottom along a ")" arc that bulges right,
// echoing the reel wheel's curve.
const RADIUS = 96 // px; larger = taller, wider arc
const PAD = 10 // room for the active dot + glow at the arc ends
const CX = PAD // circle centre sits at the left edge, so only the right half shows
const CY = PAD + RADIUS
const WIDTH = RADIUS + PAD * 2
const HEIGHT = RADIUS * 2 + PAD * 2

/** Position along the arc for t in [0, 1] (0 = top, 1 = bottom). */
function pointOnArc(t: number) {
  const theta = ((-90 + 180 * t) * Math.PI) / 180
  return { x: CX + RADIUS * Math.cos(theta), y: CY + RADIUS * Math.sin(theta) }
}

export default function ScrollDots({ total, active, onSelect }: Props) {
  // Guard against divide-by-zero when a filter leaves a single reel
  const span = Math.max(total - 1, 1)
  const tFor = (i: number) => (total === 1 ? 0.5 : i / span)
  const progress = tFor(active)

  // Map a pointer position to the nearest dot by its angle around the circle centre.
  // Pointer capture keeps drags tracking even when the cursor leaves the arc.
  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId)
    else if (e.buttons !== 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const deg = (Math.atan2(e.clientY - (rect.top + CY), e.clientX - (rect.left + CX)) * 180) / Math.PI
    const t = (Math.min(Math.max(deg, -90), 90) + 90) / 180 // 0 = top, 1 = bottom
    onSelect(Math.min(Math.round(t * span), total - 1))
  }

  const arcPath = `M ${CX} ${CY - RADIUS} A ${RADIUS} ${RADIUS} 0 0 1 ${CX} ${CY + RADIUS}`

  return (
    <div
      className="relative cursor-pointer select-none touch-none"
      style={{ width: WIDTH, height: HEIGHT }}
      onPointerDown={handlePointer}
      onPointerMove={handlePointer}
    >
      {/* Arc track + progress fill */}
      <svg width={WIDTH} height={HEIGHT} className="absolute inset-0 overflow-visible pointer-events-none">
        <path d={arcPath} fill="none" stroke="rgba(251,255,244,0.1)" strokeWidth={1.5} strokeLinecap="round" />
        <path
          d={arcPath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeOpacity={0.5}
          strokeWidth={1.5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - progress}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>

      {/* Dots */}
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === active
        const isPast = i <= active
        const { x, y } = pointOnArc(tFor(i))
        const size = isActive ? 12 : 4

        return (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-300 pointer-events-none"
            style={{
              left: x,
              top: y,
              width: size,
              height: size,
              transform: 'translate(-50%, -50%)',
              backgroundColor: isActive
                ? 'hsl(var(--primary))'
                : isPast
                  ? 'rgba(154,129,116,0.5)'
                  : 'rgba(251,255,244,0.12)',
              boxShadow: isActive ? '0 0 10px rgba(154,129,116,0.6)' : 'none',
            }}
          />
        )
      })}

      {/* Count label — sits in the hollow of the semicircle */}
      <div
        className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
        style={{ left: CX + RADIUS * 0.45, top: CY, transform: 'translate(-50%, -50%)' }}
      >
        <span className="text-[10px] font-bold tabular-nums text-primary">
          {String(active + 1).padStart(2, '0')}
        </span>
        <div className="h-px w-3" style={{ backgroundColor: 'hsl(var(--border))' }} />
        <span className="text-[10px] tabular-nums" style={{ color: 'rgba(251,255,244,0.2)' }}>
          {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

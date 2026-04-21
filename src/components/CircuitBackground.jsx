import React, { useMemo } from 'react'

/** Randomised but stable circuit-board decoration rendered as SVG */
export default function CircuitBackground() {
  // Static layout - memoized so it never re-renders
  const data = useMemo(() => {
    const traces = [
      // Horizontal traces
      { x1: 0,    y1: 120,  x2: 320,  y2: 120,  color: '#00ff88', w: 1.2, delay: 0 },
      { x1: 0,    y1: 280,  x2: 500,  y2: 280,  color: '#00d4ff', w: 0.8, delay: 0.8 },
      { x1: 100,  y1: 420,  x2: 600,  y2: 420,  color: '#00ff88', w: 1,   delay: 1.5 },
      { x1: 200,  y1: 550,  x2: 700,  y2: 550,  color: '#00d4ff', w: 0.6, delay: 2.2 },
      { x1: 800,  y1: 180,  x2: 1440, y2: 180,  color: '#00ff88', w: 1,   delay: 3 },
      { x1: 900,  y1: 360,  x2: 1440, y2: 360,  color: '#a855f7', w: 0.8, delay: 1.2 },
      { x1: 1000, y1: 500,  x2: 1440, y2: 500,  color: '#00d4ff', w: 1,   delay: 2 },
      { x1: 0,    y1: 650,  x2: 400,  y2: 650,  color: '#ffab40', w: 0.6, delay: 0.5 },
      { x1: 600,  y1: 700,  x2: 1440, y2: 700,  color: '#00ff88', w: 0.8, delay: 3.5 },
      { x1: 0,    y1: 800,  x2: 350,  y2: 800,  color: '#00d4ff', w: 1,   delay: 1.8 },
      // Vertical traces
      { x1: 200,  y1: 0,    x2: 200,  y2: 320,  color: '#00ff88', w: 1,   delay: 0.3 },
      { x1: 400,  y1: 0,    x2: 400,  y2: 480,  color: '#00d4ff', w: 0.8, delay: 1 },
      { x1: 600,  y1: 200,  x2: 600,  y2: 600,  color: '#00ff88', w: 1.2, delay: 2 },
      { x1: 850,  y1: 0,    x2: 850,  y2: 380,  color: '#a855f7', w: 0.7, delay: 0.6 },
      { x1: 1100, y1: 100,  x2: 1100, y2: 550,  color: '#00d4ff', w: 1,   delay: 1.4 },
      { x1: 1300, y1: 0,    x2: 1300, y2: 300,  color: '#00ff88', w: 0.8, delay: 2.5 },
      { x1: 320,  y1: 600,  x2: 320,  y2: 900,  color: '#00d4ff', w: 0.8, delay: 1.7 },
      { x1: 720,  y1: 500,  x2: 720,  y2: 900,  color: '#00ff88', w: 0.6, delay: 3.1 },
    ]

    const nodes = [
      { cx: 200,  cy: 120,  r: 4, color: '#00ff88' },
      { cx: 400,  cy: 280,  r: 3, color: '#00d4ff' },
      { cx: 600,  cy: 420,  r: 4, color: '#00ff88' },
      { cx: 200,  cy: 420,  r: 3, color: '#00ff88' },
      { cx: 1100, cy: 180,  r: 4, color: '#00d4ff' },
      { cx: 850,  cy: 360,  r: 3, color: '#a855f7' },
      { cx: 1100, cy: 500,  r: 4, color: '#00d4ff' },
      { cx: 320,  cy: 650,  r: 3, color: '#ffab40' },
      { cx: 720,  cy: 700,  r: 4, color: '#00ff88' },
      { cx: 320,  cy: 800,  r: 3, color: '#00d4ff' },
      { cx: 600,  cy: 280,  r: 2, color: '#00ff88' },
      { cx: 400,  cy: 120,  r: 2, color: '#00d4ff' },
      { cx: 1300, cy: 180,  r: 3, color: '#00ff88' },
    ]

    const chips = [
      { x: 420, y: 80,  w: 100, h: 60, label: 'ALU_CORE',  color: '#00ff88' },
      { x: 780, y: 200, w: 120, h: 80, label: 'MEM_CTRL',  color: '#00d4ff' },
      { x: 150, y: 480, w: 100, h: 60, label: 'FIFO_16x8', color: '#a855f7' },
      { x: 950, y: 420, w: 110, h: 70, label: 'SERDES_TX', color: '#ffab40' },
    ]

    const particles = traces.filter((_, i) => i % 3 === 0).map((t, i) => ({
      ...t,
      animDuration: 3 + (i % 3),
      animDelay: t.delay + i * 0.5,
    }))

    return { traces, nodes, chips, particles }
  }, [])

  return (
    <div className="circuit-board-bg">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {data.chips.map((c, i) => (
            <filter key={i} id={`chip-glow-${i}`}>
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
          <linearGradient id="trace-grad-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00ff88" stopOpacity="0" />
            <stop offset="50%"  stopColor="#00ff88" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── Base traces ── */}
        {data.traces.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.color}
            strokeWidth={t.w}
            strokeOpacity="0.18"
          />
        ))}

        {/* ── Animated signal particles ── */}
        {data.particles.map((t, i) => (
          <circle key={`p-${i}`} r="2" fill={t.color} fillOpacity="0.85" filter="url(#glow-green)">
            <animateMotion
              dur={`${t.animDuration}s`}
              begin={`${t.animDelay}s`}
              repeatCount="indefinite"
              path={`M${t.x1},${t.y1} L${t.x2},${t.y2}`}
            />
          </circle>
        ))}

        {/* ── Nodes / vias ── */}
        {data.nodes.map((n, i) => (
          <g key={`n-${i}`} filter="url(#glow-green)">
            <circle cx={n.cx} cy={n.cy} r={n.r + 3} fill={n.color} fillOpacity="0.06" />
            <circle cx={n.cx} cy={n.cy} r={n.r}     fill={n.color} fillOpacity="0.7" />
            <circle cx={n.cx} cy={n.cy} r={n.r + 6} fill="none" stroke={n.color} strokeWidth="0.5" strokeOpacity="0.25">
              <animate attributeName="r" values={`${n.r + 4};${n.r + 10};${n.r + 4}`} dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* ── IC chip outlines ── */}
        {data.chips.map((c, i) => (
          <g key={`c-${i}`} filter={`url(#chip-glow-${i})`}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h}
              fill={`${c.color}06`} stroke={c.color} strokeWidth="0.8" strokeOpacity="0.35"
              rx="2"
            />
            {/* Pin stubs top */}
            {[0.25, 0.5, 0.75].map((f, pi) => (
              <line key={pi}
                x1={c.x + c.w * f} y1={c.y - 6}
                x2={c.x + c.w * f} y2={c.y}
                stroke={c.color} strokeWidth="0.8" strokeOpacity="0.4"
              />
            ))}
            {/* Pin stubs bottom */}
            {[0.25, 0.5, 0.75].map((f, pi) => (
              <line key={pi}
                x1={c.x + c.w * f} y1={c.y + c.h}
                x2={c.x + c.w * f} y2={c.y + c.h + 6}
                stroke={c.color} strokeWidth="0.8" strokeOpacity="0.4"
              />
            ))}
            {/* Label */}
            <text
              x={c.x + c.w / 2} y={c.y + c.h / 2 + 4}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="7"
              fill={c.color}
              fillOpacity="0.55"
            >
              {c.label}
            </text>
          </g>
        ))}

        {/* ── Corner bracket decorations ── */}
        {[
          [20, 20], [1420, 20], [20, 880], [1420, 880]
        ].map(([x, y], i) => {
          const sx = i % 2 === 0 ? 1 : -1
          const sy = i < 2 ? 1 : -1
          return (
            <g key={`cb-${i}`} stroke="#00ff88" strokeWidth="1" strokeOpacity="0.2" fill="none">
              <line x1={x} y1={y} x2={x + sx * 24} y2={y} />
              <line x1={x} y1={y} x2={x} y2={y + sy * 24} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

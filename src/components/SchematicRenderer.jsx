import React, { useMemo, useState } from 'react'

// ── Symbol definitions ──────────────────────────────────────────────
const SYMBOLS = {
  resistor: ({ x, y, w = 60, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="0" x2="10" y2="0" stroke={color} strokeWidth="1.5"/>
      <rect x="10" y="-8" width="40" height="16" fill="none" stroke={color} strokeWidth="1.5" rx="2"/>
      <line x1="50" y1="0" x2="60" y2="0" stroke={color} strokeWidth="1.5"/>
    </g>
  ),
  capacitor: ({ x, y, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="0" x2="22" y2="0" stroke={color} strokeWidth="1.5"/>
      <line x1="22" y1="-14" x2="22" y2="14" stroke={color} strokeWidth="2.5"/>
      <line x1="28" y1="-14" x2="28" y2="14" stroke={color} strokeWidth="2.5"/>
      <line x1="28" y1="0" x2="50" y2="0" stroke={color} strokeWidth="1.5"/>
    </g>
  ),
  inductor: ({ x, y, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="0" x2="8" y2="0" stroke={color} strokeWidth="1.5"/>
      <path d="M8,0 C8,-12 20,-12 20,0 C20,-12 32,-12 32,0 C32,-12 44,-12 44,0" fill="none" stroke={color} strokeWidth="1.5"/>
      <line x1="44" y1="0" x2="52" y2="0" stroke={color} strokeWidth="1.5"/>
    </g>
  ),
  nmos: ({ x, y, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      {/* Body */}
      <line x1="20" y1="-30" x2="20" y2="30" stroke={color} strokeWidth="1.5"/>
      {/* Gate */}
      <line x1="0" y1="0" x2="14" y2="0" stroke={color} strokeWidth="1.5"/>
      <line x1="14" y1="-20" x2="14" y2="20" stroke={color} strokeWidth="2"/>
      {/* Drain */}
      <line x1="20" y1="-20" x2="40" y2="-20" stroke={color} strokeWidth="1.5"/>
      <line x1="20" y1="-20" x2="20" y2="-30" stroke={color} strokeWidth="1.5"/>
      {/* Source */}
      <line x1="20" y1="20" x2="40" y2="20" stroke={color} strokeWidth="1.5"/>
      <line x1="20" y1="20" x2="20" y2="30" stroke={color} strokeWidth="1.5"/>
      {/* Channel lines */}
      <line x1="17" y1="-18" x2="17" y2="-6" stroke={color} strokeWidth="1.5"/>
      <line x1="17" y1="-3" x2="17" y2="3" stroke={color} strokeWidth="1.5"/>
      <line x1="17" y1="6" x2="17" y2="18" stroke={color} strokeWidth="1.5"/>
      {/* Arrow indicating N-type */}
      <polygon points="20,0 14,4 14,-4" fill={color}/>
      <text x="42" y="-16" fontSize="9" fill={color} fontFamily="JetBrains Mono">D</text>
      <text x="42" y="24" fontSize="9" fill={color} fontFamily="JetBrains Mono">S</text>
      <text x="-4" y="4" fontSize="9" fill={color} fontFamily="JetBrains Mono">G</text>
    </g>
  ),
  pmos: ({ x, y, color = '#00d4ff' }) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="20" y1="-30" x2="20" y2="30" stroke={color} strokeWidth="1.5"/>
      <line x1="0" y1="0" x2="12" y2="0" stroke={color} strokeWidth="1.5"/>
      <circle cx="13" cy="0" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <line x1="15" y1="-20" x2="15" y2="20" stroke={color} strokeWidth="2"/>
      <line x1="20" y1="-20" x2="40" y2="-20" stroke={color} strokeWidth="1.5"/>
      <line x1="20" y1="-20" x2="20" y2="-30" stroke={color} strokeWidth="1.5"/>
      <line x1="20" y1="20" x2="40" y2="20" stroke={color} strokeWidth="1.5"/>
      <line x1="20" y1="20" x2="20" y2="30" stroke={color} strokeWidth="1.5"/>
      <line x1="18" y1="-18" x2="18" y2="-6" stroke={color} strokeWidth="1.5"/>
      <line x1="18" y1="-3" x2="18" y2="3" stroke={color} strokeWidth="1.5"/>
      <line x1="18" y1="6" x2="18" y2="18" stroke={color} strokeWidth="1.5"/>
      <polygon points="15,0 21,4 21,-4" fill={color}/>
      <text x="42" y="-16" fontSize="9" fill={color} fontFamily="JetBrains Mono">D</text>
      <text x="42" y="24" fontSize="9" fill={color} fontFamily="JetBrains Mono">S</text>
      <text x="-4" y="4" fontSize="9" fill={color} fontFamily="JetBrains Mono">G</text>
    </g>
  ),
  and_gate: ({ x, y, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      <path d="M10,-20 L10,20 Q40,20 40,0 Q40,-20 10,-20 Z" fill="rgba(0,255,136,0.05)" stroke={color} strokeWidth="1.5"/>
      <line x1="0" y1="-10" x2="10" y2="-10" stroke={color} strokeWidth="1.5"/>
      <line x1="0" y1="10" x2="10" y2="10" stroke={color} strokeWidth="1.5"/>
      <line x1="40" y1="0" x2="52" y2="0" stroke={color} strokeWidth="1.5"/>
      <text x="18" y="5" fontSize="10" fill={color} fontFamily="JetBrains Mono">&amp;</text>
    </g>
  ),
  or_gate: ({ x, y, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      <path d="M8,-20 Q20,-20 42,0 Q20,20 8,20 Q18,10 18,0 Q18,-10 8,-20 Z" fill="rgba(0,255,136,0.05)" stroke={color} strokeWidth="1.5"/>
      <line x1="0" y1="-10" x2="13" y2="-10" stroke={color} strokeWidth="1.5"/>
      <line x1="0" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1.5"/>
      <line x1="42" y1="0" x2="54" y2="0" stroke={color} strokeWidth="1.5"/>
      <text x="16" y="5" fontSize="10" fill={color} fontFamily="JetBrains Mono">≥1</text>
    </g>
  ),
  not_gate: ({ x, y, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,-16 32,0 0,16" fill="rgba(0,255,136,0.05)" stroke={color} strokeWidth="1.5"/>
      <circle cx="35" cy="0" r="4" fill="rgba(0,255,136,0.05)" stroke={color} strokeWidth="1.5"/>
      <line x1="-12" y1="0" x2="0" y2="0" stroke={color} strokeWidth="1.5"/>
      <line x1="39" y1="0" x2="52" y2="0" stroke={color} strokeWidth="1.5"/>
      <text x="8" y="5" fontSize="9" fill={color} fontFamily="JetBrains Mono">1</text>
    </g>
  ),
  xor_gate: ({ x, y, color = '#a855f7' }) => (
    <g transform={`translate(${x},${y})`}>
      <path d="M8,-20 Q20,-20 42,0 Q20,20 8,20 Q18,10 18,0 Q18,-10 8,-20 Z" fill="rgba(168,85,247,0.05)" stroke={color} strokeWidth="1.5"/>
      <path d="M4,-20 Q14,-10 14,0 Q14,10 4,20" fill="none" stroke={color} strokeWidth="1.5"/>
      <line x1="0" y1="-10" x2="13" y2="-10" stroke={color} strokeWidth="1.5"/>
      <line x1="0" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1.5"/>
      <line x1="42" y1="0" x2="54" y2="0" stroke={color} strokeWidth="1.5"/>
      <text x="16" y="5" fontSize="10" fill={color} fontFamily="JetBrains Mono">=1</text>
    </g>
  ),
  dff: ({ x, y, color = '#ffab40' }) => (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="-30" width="60" height="60" fill="rgba(255,171,64,0.05)" stroke={color} strokeWidth="1.5" rx="3"/>
      <text x="20" y="-8" fontSize="10" fill={color} fontFamily="JetBrains Mono" fontWeight="bold">D-FF</text>
      <text x="5" y="6" fontSize="8" fill={color} fontFamily="JetBrains Mono">D</text>
      <text x="5" y="18" fontSize="8" fill={color} fontFamily="JetBrains Mono">CLK</text>
      <text x="40" y="6" fontSize="8" fill={color} fontFamily="JetBrains Mono">Q</text>
      <text x="35" y="18" fontSize="8" fill={color} fontFamily="JetBrains Mono">Q̄</text>
      {/* Clock triangle */}
      <polygon points="0,12 8,18 0,24" fill="none" stroke={color} strokeWidth="1"/>
      <line x1="-20" y1="0" x2="0" y2="0" stroke={color} strokeWidth="1.5"/>
      <line x1="-20" y1="18" x2="0" y2="18" stroke={color} strokeWidth="1.5"/>
      <line x1="60" y1="0" x2="80" y2="0" stroke={color} strokeWidth="1.5"/>
      <line x1="60" y1="18" x2="80" y2="18" stroke={color} strokeWidth="1.5"/>
    </g>
  ),
  mux2: ({ x, y, color = '#40c4ff' }) => (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,-30 0,30 40,20 40,-20" fill="rgba(64,196,255,0.05)" stroke={color} strokeWidth="1.5"/>
      <text x="10" y="5" fontSize="9" fill={color} fontFamily="JetBrains Mono">MUX</text>
      <line x1="-20" y1="-15" x2="0" y2="-15" stroke={color} strokeWidth="1.5"/>
      <line x1="-20" y1="15" x2="0" y2="15" stroke={color} strokeWidth="1.5"/>
      <line x1="20" y1="30" x2="20" y2="45" stroke={color} strokeWidth="1.5"/>
      <line x1="40" y1="0" x2="60" y2="0" stroke={color} strokeWidth="1.5"/>
      <text x="-30" y="-11" fontSize="8" fill={color} fontFamily="JetBrains Mono">I0</text>
      <text x="-30" y="19" fontSize="8" fill={color} fontFamily="JetBrains Mono">I1</text>
      <text x="15" y="58" fontSize="8" fill={color} fontFamily="JetBrains Mono">S</text>
    </g>
  ),
  opamp: ({ x, y, color = '#00ff88' }) => (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,-30 0,30 50,0" fill="rgba(0,255,136,0.05)" stroke={color} strokeWidth="1.5"/>
      <line x1="-20" y1="-15" x2="0" y2="-15" stroke={color} strokeWidth="1.5"/>
      <line x1="-20" y1="15" x2="0" y2="15" stroke={color} strokeWidth="1.5"/>
      <line x1="50" y1="0" x2="70" y2="0" stroke={color} strokeWidth="1.5"/>
      <text x="6" y="-10" fontSize="10" fill={color} fontFamily="JetBrains Mono">+</text>
      <text x="6" y="20" fontSize="10" fill={color} fontFamily="JetBrains Mono">−</text>
    </g>
  ),
  vcc: ({ x, y, color = '#ff4560', label = 'VCC' }) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="0" x2="0" y2="-20" stroke={color} strokeWidth="1.5"/>
      <line x1="-14" y1="-20" x2="14" y2="-20" stroke={color} strokeWidth="2"/>
      <line x1="-9" y1="-25" x2="9" y2="-25" stroke={color} strokeWidth="1.5"/>
      <line x1="-4" y1="-30" x2="4" y2="-30" stroke={color} strokeWidth="1"/>
      <text x="-12" y="-34" fontSize="9" fill={color} fontFamily="JetBrains Mono" fontWeight="bold">{label}</text>
    </g>
  ),
  gnd: ({ x, y, color = '#6b8499' }) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="0" x2="0" y2="16" stroke={color} strokeWidth="1.5"/>
      <line x1="-14" y1="16" x2="14" y2="16" stroke={color} strokeWidth="2"/>
      <line x1="-9" y1="21" x2="9" y2="21" stroke={color} strokeWidth="1.5"/>
      <line x1="-4" y1="26" x2="4" y2="26" stroke={color} strokeWidth="1"/>
      <text x="-10" y="38" fontSize="9" fill={color} fontFamily="JetBrains Mono">GND</text>
    </g>
  ),
  wire_dot: ({ x, y, color = '#00ff88' }) => (
    <circle cx={x} cy={y} r="3.5" fill={color}/>
  ),
  port_in: ({ x, y, label = 'IN', color = '#00d4ff' }) => (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,-10 30,-10 40,0 30,10 0,10" fill="rgba(0,212,255,0.08)" stroke={color} strokeWidth="1.2"/>
      <text x="5" y="4" fontSize="8" fill={color} fontFamily="JetBrains Mono">{label}</text>
    </g>
  ),
  port_out: ({ x, y, label = 'OUT', color = '#00d4ff' }) => (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,-10 30,-10 40,0 30,10 0,10" fill="rgba(0,212,255,0.08)" stroke={color} strokeWidth="1.2"/>
      <text x="3" y="4" fontSize="8" fill={color} fontFamily="JetBrains Mono">{label}</text>
    </g>
  ),
}

// ── Wire router: draws orthogonal wires ──────────────────────────
function Wire({ x1, y1, x2, y2, color = '#00ff88', label }) {
  const midX = (x1 + x2) / 2
  return (
    <g>
      <path
        d={`M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}`}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.75"
      />
      {label && (
        <text x={midX + 3} y={(y1 + y2) / 2} fontSize="8" fill={color} fillOpacity="0.7" fontFamily="JetBrains Mono">
          {label}
        </text>
      )}
    </g>
  )
}

// ── Component label ──────────────────────────────────────────────
function ComponentLabel({ x, y, name, value, color }) {
  return (
    <g>
      <text x={x} y={y} fontSize="9" fill={color} fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">{name}</text>
      {value && <text x={x} y={y + 11} fontSize="8" fill={color} fontFamily="JetBrains Mono" fillOpacity="0.7" textAnchor="middle">{value}</text>}
    </g>
  )
}

// ── Parse AI JSON schematic ──────────────────────────────────────
function parseSchematicJSON(text) {
  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)```/) || text.match(/\{[\s\S]*"components"[\s\S]*\}/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
    return JSON.parse(jsonStr.trim())
  } catch {
    return null
  }
}

// ── Main renderer ────────────────────────────────────────────────
export default function SchematicRenderer({ data, title = 'Schematic', accent = '#00ff88' }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  if (!data) return null

  const { components = [], wires = [], ports = [], title: schTitle } = data
  const viewW = 900
  const viewH = 600

  const onMouseDown = (e) => {
    setDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }
  const onMouseMove = (e) => {
    if (!dragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const onMouseUp = () => setDragging(false)

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        background: '#020508',
        border: `1px solid ${accent}30`,
        boxShadow: `0 0 30px ${accent}10`,
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: `${accent}08`, borderBottom: `1px solid ${accent}20` }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: accent }}>
            ◈ {schTitle || title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-scope-muted">
            {components.length} components · {wires.length} nets
          </span>
          <button
            onClick={() => { setZoom(v => Math.min(v + 0.2, 3)) }}
            className="font-mono text-[10px] px-2 py-0.5 rounded transition-colors"
            style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}
          >+</button>
          <span className="font-mono text-[10px]" style={{ color: accent }}>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => { setZoom(v => Math.max(v - 0.2, 0.4)) }}
            className="font-mono text-[10px] px-2 py-0.5 rounded transition-colors"
            style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}
          >−</button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
            className="font-mono text-[10px] px-2 py-0.5 rounded transition-colors"
            style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}
          >Reset</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        style={{ width: '100%', height: 480, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', position: 'relative' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Grid background */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <pattern id="sch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={accent} strokeWidth="0.15" strokeOpacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sch-grid)"/>
        </svg>

        {/* Main schematic SVG */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${viewW / zoom} ${viewH / zoom}`}
        >
          {/* Wires */}
          {wires.map((w, i) => (
            <Wire key={i} {...w} color={w.color || accent} />
          ))}

          {/* Components */}
          {components.map((c, i) => {
            const Symbol = SYMBOLS[c.type]
            if (!Symbol) return null
            return (
              <g key={i}>
                <Symbol x={c.x} y={c.y} color={c.color || accent} label={c.label} />
                {c.label && (
                  <ComponentLabel
                    x={c.x + (c.labelOffsetX || 0)}
                    y={c.y + (c.labelOffsetY || 30)}
                    name={c.label}
                    value={c.value}
                    color={c.color || accent}
                  />
                )}
              </g>
            )
          })}

          {/* Ports */}
          {ports.map((p, i) => {
            const Symbol = p.dir === 'in' ? SYMBOLS.port_in : SYMBOLS.port_out
            return (
              <g key={i}>
                <Symbol x={p.x} y={p.y} label={p.name} color={p.color || '#00d4ff'} />
              </g>
            )
          })}
        </svg>
      </div>

      <div
        className="px-4 py-1.5 font-mono text-[8px] text-scope-muted"
        style={{ borderTop: `1px solid ${accent}10` }}
      >
        Drag to pan · +/− to zoom · Components: {components.map(c => `${c.label || c.type}(${c.type})`).join(', ')}
      </div>
    </div>
  )
}

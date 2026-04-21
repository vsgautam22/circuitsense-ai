import React, { useMemo, useState } from 'react'

// ── Layout constants ──────────────────────────────────────────────────────────
const MODULE_W = 160
const MODULE_H_BASE = 40
const PORT_PITCH = 22
const PORT_R = 4
const H_GAP = 100   // horizontal gap between column of blocks
const V_GAP = 28    // vertical gap between blocks in same column
const LEFT_PAD = 80 // space for top-level input ports
const TOP_PAD = 40

// ── Colour palette per module type ───────────────────────────────────────────
const TYPE_COLORS = {
  AND2:'#00e676', AND3:'#00e676', OR2:'#00c4ff', OR3:'#00c4ff',
  NAND2:'#ff6e40', NOR2:'#ff6e40', XOR2:'#d4a0ff', XNOR2:'#d4a0ff',
  NOT:'#ffab40', INV:'#ffab40', BUF:'#cfd8dc',
  DFF:'#00b0ff', DFFE:'#00b0ff', FDRE:'#00b0ff', FDSE:'#00b0ff',
  LUT2:'#69f0ae', LUT3:'#69f0ae', LUT4:'#00e676', LUT5:'#00e676', LUT6:'#00c853',
  MUX:'#ffd740', MUX2:'#ffd740', MUX4:'#ffd740',
  RAM:'#ff80ab', ROM:'#ff80ab', BRAM:'#ff4081',
  ADDER:'#64ffda', ALU:'#64ffda', MULT:'#40c4ff',
  REG:'#00b0ff', REG8:'#00b0ff', REG16:'#00b0ff', REG32:'#00b0ff',
  IBUF:'#cfd8dc', OBUF:'#cfd8dc', PORT:'#00e676',
  CLK:'#ffd740', RST:'#ff6e40',
  DEFAULT:'#546e7a',
}

function moduleColor(type) {
  const key = (type || '').toUpperCase()
  return TYPE_COLORS[key] || TYPE_COLORS.DEFAULT
}

// ── Parse JSON block that AI emits ───────────────────────────────────────────
function parseHierarchy(text) {
  // Try to extract first JSON object from text
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try { return JSON.parse(match[0]) } catch { return null }
}

// ── Assign (col, row) to each module deterministically ───────────────────────
function layoutModules(modules, nets) {
  // Simple topological layering
  const ids = modules.map(m => m.id)
  const depCount = {}
  const dependsOn = {}
  ids.forEach(id => { depCount[id] = 0; dependsOn[id] = [] })

  nets.forEach(net => {
    const [fromId] = net.from.split('.')
    const [toId]   = net.to.split('.')
    if (ids.includes(fromId) && ids.includes(toId)) {
      depCount[toId] = (depCount[toId] || 0) + 1
      dependsOn[toId].push(fromId)
    }
  })

  const cols = {}
  let remaining = [...ids]
  let col = 0
  while (remaining.length) {
    const ready = remaining.filter(id => depCount[id] === 0)
    if (!ready.length) { ready.push(remaining[0]) } // break cycle
    ready.forEach(id => { cols[id] = col })
    remaining = remaining.filter(id => !ready.includes(id))
    // Reduce counts of dependents
    ready.forEach(id => {
      ids.forEach(other => {
        if (dependsOn[other]?.includes(id)) {
          depCount[other] = Math.max(0, (depCount[other] || 1) - 1)
        }
      })
    })
    col++
  }

  // Group by column
  const colGroups = {}
  ids.forEach(id => {
    const c = cols[id] || 0
    if (!colGroups[c]) colGroups[c] = []
    colGroups[c].push(id)
  })

  // Assign positions
  const positions = {}
  Object.entries(colGroups).forEach(([c, group]) => {
    group.forEach((id, row) => {
      positions[id] = { col: Number(c), row }
    })
  })
  return { positions, colGroups }
}

function computeGeometry(modules, nets, topPorts) {
  if (!modules.length) return { nodes: [], edges: [], width: 400, height: 200 }

  const { positions, colGroups } = layoutModules(modules, nets)
  const maxCol = Math.max(...Object.values(positions).map(p => p.col))

  // Pre-calc height of each module
  const modMap = {}
  modules.forEach(m => { modMap[m.id] = m })

  const colHeights = {}
  Object.entries(colGroups).forEach(([c, group]) => {
    let totalH = 0
    group.forEach(id => {
      const m = modMap[id]
      const h = Math.max(MODULE_H_BASE, Math.max((m.inputs||[]).length, (m.outputs||[]).length) * PORT_PITCH + 16)
      totalH += h + V_GAP
    })
    colHeights[Number(c)] = totalH
  })

  const maxH = Math.max(200, ...Object.values(colHeights))

  // Compute x for each column
  const colX = {}
  let xCursor = LEFT_PAD
  for (let c = 0; c <= maxCol; c++) {
    colX[c] = xCursor
    xCursor += MODULE_W + H_GAP
  }

  // Compute node positions (top-left corner of each box)
  const nodes = []
  Object.entries(colGroups).forEach(([c, group]) => {
    const col = Number(c)
    const totalH = group.reduce((acc, id) => {
      const m = modMap[id]
      const h = Math.max(MODULE_H_BASE, Math.max((m.inputs||[]).length, (m.outputs||[]).length) * PORT_PITCH + 16)
      return acc + h + V_GAP
    }, 0) - V_GAP

    let yCursor = TOP_PAD + (maxH - totalH) / 2
    group.forEach(id => {
      const m = modMap[id]
      const numPorts = Math.max((m.inputs||[]).length, (m.outputs||[]).length)
      const h = Math.max(MODULE_H_BASE, numPorts * PORT_PITCH + 16)
      nodes.push({
        id: m.id, type: m.type, label: m.label || m.type,
        inputs: m.inputs || [], outputs: m.outputs || [],
        x: colX[col], y: yCursor, w: MODULE_W, h,
      })
      yCursor += h + V_GAP
    })
  })

  // Port anchor helpers
  const portAnchors = {}
  nodes.forEach(n => {
    portAnchors[n.id] = { in: {}, out: {} }
    n.inputs.forEach((p, i) => {
      portAnchors[n.id].in[p] = { x: n.x, y: n.y + 20 + i * PORT_PITCH }
    })
    n.outputs.forEach((p, i) => {
      portAnchors[n.id].out[p] = { x: n.x + n.w, y: n.y + 20 + i * PORT_PITCH }
    })
  })

  // top-level input anchors (left edge)
  const inputAnchors = {}
  ;(topPorts?.inputs || []).forEach((p, i) => {
    inputAnchors[p] = { x: 0, y: TOP_PAD + 30 + i * PORT_PITCH }
  })
  const outputAnchors = {}
  ;(topPorts?.outputs || []).forEach((p, i) => {
    outputAnchors[p] = { x: xCursor, y: TOP_PAD + 30 + i * PORT_PITCH }
  })

  // Build edge paths
  const edges = nets.map((net, idx) => {
    const [fromId, fromPort] = net.from.split('.')
    const [toId, toPort]     = net.to.split('.')
    let ax, ay, bx, by

    if (portAnchors[fromId]?.out[fromPort]) {
      ({ x: ax, y: ay } = portAnchors[fromId].out[fromPort])
    } else if (inputAnchors[fromId]) {
      ({ x: ax, y: ay } = inputAnchors[fromId])
    } else { ax = 0; ay = 0 }

    if (portAnchors[toId]?.in[toPort]) {
      ({ x: bx, y: by } = portAnchors[toId].in[toPort])
    } else if (outputAnchors[toId]) {
      ({ x: bx, y: by } = outputAnchors[toId])
    } else { bx = 0; by = 0 }

    const mx = (ax + bx) / 2
    const path = `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`
    return { id: idx, path, name: net.name || '', ax, ay, bx, by }
  })

  const svgW = xCursor + 40
  const svgH = maxH + TOP_PAD * 2

  return {
    nodes, edges,
    width: svgW, height: svgH,
    portAnchors, inputAnchors, outputAnchors,
    topPorts: topPorts || { inputs: [], outputs: [] },
    topX: xCursor,
  }
}

// ── Module Box ────────────────────────────────────────────────────────────────
function ModuleBox({ node, accent }) {
  const [hovered, setHovered] = useState(false)
  const color = moduleColor(node.type)

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Shadow */}
      <rect x={node.x + 3} y={node.y + 3} width={node.w} height={node.h}
        rx={4} fill="rgba(0,0,0,0.5)" />
      {/* Body */}
      <rect x={node.x} y={node.y} width={node.w} height={node.h}
        rx={4}
        fill={hovered ? `${color}22` : `${color}10`}
        stroke={hovered ? color : `${color}60`}
        strokeWidth={hovered ? 1.5 : 1} />
      {/* Type label (top bar) */}
      <rect x={node.x} y={node.y} width={node.w} height={14} rx={4}
        fill={`${color}28`} />
      <text x={node.x + node.w / 2} y={node.y + 10}
        textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace"
        fill={color} fontWeight="bold" letterSpacing={1}>
        {node.type.toUpperCase()}
      </text>
      {/* Instance label */}
      <text x={node.x + node.w / 2} y={node.y + 26}
        textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace"
        fill="#cfd8dc">
        {node.label.length > 16 ? node.label.slice(0, 14) + '…' : node.label}
      </text>

      {/* Input ports */}
      {node.inputs.map((p, i) => {
        const py = node.y + 20 + i * PORT_PITCH
        return (
          <g key={`in-${p}`}>
            <circle cx={node.x} cy={py} r={PORT_R}
              fill={`${color}20`} stroke={`${color}80`} strokeWidth={1} />
            <text x={node.x + 8} y={py + 3.5}
              fontSize={8} fontFamily="JetBrains Mono, monospace" fill="#78909c">
              {p.length > 8 ? p.slice(0, 7) + '…' : p}
            </text>
          </g>
        )
      })}

      {/* Output ports */}
      {node.outputs.map((p, i) => {
        const py = node.y + 20 + i * PORT_PITCH
        return (
          <g key={`out-${p}`}>
            <circle cx={node.x + node.w} cy={py} r={PORT_R}
              fill={`${color}30`} stroke={color} strokeWidth={1} />
            <text x={node.x + node.w - 8} y={py + 3.5}
              textAnchor="end" fontSize={8} fontFamily="JetBrains Mono, monospace" fill="#b0bec5">
              {p.length > 8 ? p.slice(0, 7) + '…' : p}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ── Main Viewer ───────────────────────────────────────────────────────────────
export default function SchematicViewer({ output, accent }) {
  const [zoom, setZoom] = useState(1)
  const [showRaw, setShowRaw] = useState(false)

  const hierarchy = useMemo(() => {
    if (!output) return null
    // Find JSON block in output
    const jsonMatch = output.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    const raw = jsonMatch ? jsonMatch[1] : output
    return parseHierarchy(raw)
  }, [output])

  const { nodes, edges, width, height, topPorts, topX } = useMemo(() => {
    if (!hierarchy) return { nodes: [], edges: [], width: 400, height: 200 }
    return computeGeometry(
      hierarchy.modules || [],
      hierarchy.nets || [],
      hierarchy.ports || { inputs: [], outputs: [] }
    )
  }, [hierarchy])

  const ac = accent || '#00e676'

  if (!hierarchy || !nodes.length) {
    return (
      <div className="flex items-center justify-center h-32 font-mono text-[10px]"
        style={{ color: '#546e7a' }}>
        No schematic data parsed yet — send a prompt above.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${ac}20`, background: `${ac}06` }}>
        <span className="font-mono text-[9px] font-bold tracking-widest" style={{ color: ac }}>
          SCHEMATIC VIEW — {hierarchy.top || 'DESIGN'}
        </span>
        <span className="font-mono text-[9px] text-scope-muted ml-2">
          {nodes.length} modules · {edges.length} nets
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1)))}
            className="w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#78909c' }}>−</button>
          <span className="font-mono text-[9px]" style={{ color: ac }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
            className="w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#78909c' }}>+</button>
          <button onClick={() => setZoom(1)}
            className="px-2 h-5 rounded font-mono text-[9px]"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#78909c' }}>fit</button>
          <button onClick={() => setShowRaw(v => !v)}
            className="px-2 h-5 rounded font-mono text-[9px]"
            style={{ background: showRaw ? `${ac}18` : 'rgba(255,255,255,0.04)', color: showRaw ? ac : '#78909c',
              border: `1px solid ${showRaw ? ac + '40' : 'transparent'}` }}>
            JSON
          </button>
        </div>
      </div>

      {showRaw ? (
        <pre className="flex-1 overflow-auto p-4 font-mono text-[10px] text-scope-dim" style={{ background: 'rgba(0,0,0,0.4)' }}>
          {JSON.stringify(hierarchy, null, 2)}
        </pre>
      ) : (
        <div className="flex-1 overflow-auto" style={{ background: 'rgba(2,4,6,0.7)' }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', display: 'inline-block' }}>
            <svg width={width} height={height}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {/* Grid */}
              <defs>
                <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke={`${ac}08`} strokeWidth={0.5} />
                </pattern>
              </defs>
              <rect width={width} height={height} fill="url(#grid)" />

              {/* Top-level input ports (left) */}
              {(topPorts.inputs || []).map((p, i) => {
                const py = TOP_PAD + 30 + i * PORT_PITCH
                return (
                  <g key={`tpin-${p}`}>
                    <rect x={2} y={py - 8} width={52} height={16} rx={3}
                      fill={`${ac}18`} stroke={`${ac}50`} strokeWidth={1} />
                    <text x={28} y={py + 4} textAnchor="middle" fontSize={8} fill={ac} fontWeight="bold">
                      {p}
                    </text>
                    <line x1={54} y1={py} x2={LEFT_PAD - 2} y2={py}
                      stroke={`${ac}60`} strokeWidth={1} strokeDasharray="3,2" />
                    <circle cx={LEFT_PAD - 2} cy={py} r={2} fill={ac} />
                  </g>
                )
              })}

              {/* Top-level output ports (right) */}
              {(topPorts.outputs || []).map((p, i) => {
                const py = TOP_PAD + 30 + i * PORT_PITCH
                return (
                  <g key={`tpout-${p}`}>
                    <rect x={topX - 2} y={py - 8} width={52} height={16} rx={3}
                      fill={`${ac}18`} stroke={`${ac}50`} strokeWidth={1} />
                    <text x={topX + 24} y={py + 4} textAnchor="middle" fontSize={8} fill={ac} fontWeight="bold">
                      {p}
                    </text>
                    <circle cx={topX - 2} cy={py} r={2} fill={ac} />
                  </g>
                )
              })}

              {/* Wires */}
              {edges.map(e => (
                <g key={e.id}>
                  <path d={e.path} fill="none" stroke={`${ac}35`} strokeWidth={1.2}
                    strokeLinecap="round" />
                  {/* Net label at midpoint */}
                  {e.name && (
                    <text
                      x={(e.ax + e.bx) / 2} y={(e.ay + e.by) / 2 - 4}
                      textAnchor="middle" fontSize={7} fill="#546e7a"
                    >{e.name}</text>
                  )}
                </g>
              ))}

              {/* Module boxes */}
              {nodes.map(n => (
                <ModuleBox key={n.id} node={n} accent={ac} />
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

import { Terminal, Github, ExternalLink, Cpu, Layers, GitBranch } from 'lucide-react'
import { detectProvider, providerLabel, providerColor } from '../lib/claudeClient.js'

/** Oscilloscope waveform SVG — static decoration */
function Waveform({ color = '#00ff88', width = 120, height = 22 }) {
  const pts = [0,11, 10,11, 15,3, 20,19, 25,3, 30,19, 35,11, 55,11, 60,3, 65,19, 70,3, 75,11, 95,11, 100,3, 105,19, 110,11, width,11]
  const d = pts.reduce((acc, v, i) => acc + (i === 0 ? `M${v}` : i % 2 === 1 ? `,${v}` : ` L${v}`), '')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-40">
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

export default function TopBar({ activeTool, apiKey }) {
  const pType = detectProvider(apiKey)
  const pColor = providerColor(apiKey)
  const pLabel = providerLabel(apiKey)

  const STAT_CHIPS = [
    { label: 'PDK',    value: 'SKY130A',  color: '#00ff88' },
    { label: 'MODEL',  value: pType === 'unknown' ? 'NO_KEY' : pLabel.toUpperCase(), color: pColor },
    { label: 'NODE',   value: '130nm',     color: '#a855f7' },
  ]

  return (
    <header className="relative flex-shrink-0 z-10">
      {/* Top accent gradient bar */}
      <div className="accent-bar" />

      <div
        className="flex items-center justify-between px-5 py-2.5"
        style={{ background: 'rgba(8,13,20,0.9)', borderBottom: '1px solid rgba(20,32,48,0.8)' }}
      >
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-3">
          <Terminal size={12} className="text-scope-green flex-shrink-0" />
          <span className="font-mono text-xs text-scope-dim">
            <span className="text-scope-green/70">~/vlsi/</span>
            <span className="text-scope-dim">circuitsense</span>
            {activeTool && (
              <>
                <span className="text-scope-muted mx-1">›</span>
                <span style={{ color: activeTool.accent }} className="font-semibold">
                  {activeTool.id}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Center: waveform + tool name */}
        <div className="hidden md:flex items-center gap-3">
          <Waveform color="#00ff88" />
          {activeTool && (
            <span
              className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded"
              style={{
                color: activeTool.accent,
                background: `${activeTool.accent}10`,
                border: `1px solid ${activeTool.accent}30`,
              }}
            >
              {activeTool.label.toUpperCase()}
            </span>
          )}
          <Waveform color="#00d4ff" />
        </div>

        {/* Right: status chips + links */}
        <div className="flex items-center gap-3">
          {/* Stat chips */}
          {STAT_CHIPS.map(s => (
            <div key={s.label} className="hidden lg:flex items-center gap-1.5">
              <span className="font-mono text-[8px] text-scope-muted">{s.label}</span>
              <span
                className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={{ color: s.color, background: `${s.color}10`, border: `1px solid ${s.color}25` }}
              >
                {s.value}
              </span>
            </div>
          ))}

          {/* Separator */}
          <div className="w-px h-4 bg-scope-border hidden lg:block" />

          {/* Live dot */}
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-scope-green pulse-dot" />
            <span className="font-mono text-[10px] text-scope-dim">LIVE</span>
          </div>

          {/* GitHub */}
          <a
            href="https://github.com/vsgautam22"
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] text-scope-dim hover:text-scope-text transition-colors"
            title="View on GitHub"
          >
            <Github size={13} />
          </a>
        </div>
      </div>
    </header>
  )
}

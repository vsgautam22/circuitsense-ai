import React, { useState } from 'react'
import { Zap, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { detectProvider, providerLabel, providerColor } from '../lib/claudeClient.js'

// ── Mini VLSI SVG icons per tool ──────────────────────────────────────────────
function ToolSVG({ toolId, color, size = 28 }) {
  const c = color
  const s = size

  if (toolId === 'schematic') return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <rect x="2" y="8" width="8" height="12" rx="1.5" stroke={c} strokeWidth="1.2" fill={`${c}10`}/>
      <rect x="18" y="8" width="8" height="12" rx="1.5" stroke={c} strokeWidth="1.2" fill={`${c}10`}/>
      <line x1="10" y1="14" x2="18" y2="14" stroke={c} strokeWidth="1.2"/>
      <circle cx="10" cy="14" r="1.5" fill={c}/>
      <circle cx="18" cy="14" r="1.5" fill={c}/>
      <line x1="6" y1="8" x2="6" y2="5" stroke={c} strokeWidth="1"/>
      <line x1="22" y1="20" x2="22" y2="23" stroke={c} strokeWidth="1"/>
      <line x1="4" y1="5" x2="8" y2="5" stroke={c} strokeWidth="1"/>
      <line x1="20" y1="23" x2="24" y2="23" stroke={c} strokeWidth="1"/>
    </svg>
  )

  if (toolId === 'protocol') return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <line x1="2" y1="10" x2="6" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="6" y1="10" x2="6" y2="7" stroke={c} strokeWidth="1.2"/>
      <line x1="6" y1="7" x2="12" y2="7" stroke={c} strokeWidth="1.2"/>
      <line x1="12" y1="7" x2="12" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="12" y1="10" x2="16" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="16" y1="10" x2="16" y2="7" stroke={c} strokeWidth="1.2"/>
      <line x1="16" y1="7" x2="22" y2="7" stroke={c} strokeWidth="1.2"/>
      <line x1="22" y1="7" x2="22" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="22" y1="10" x2="26" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="2" y1="18" x2="8" y2="18" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="18" x2="8" y2="15" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="15" x2="14" y2="15" stroke={c} strokeWidth="1.2"/>
      <line x1="14" y1="15" x2="14" y2="18" stroke={c} strokeWidth="1.2"/>
      <line x1="14" y1="18" x2="26" y2="18" stroke={c} strokeWidth="1.2"/>
      <text x="3" y="25" fontSize="5" fill={c} fontFamily="JetBrains Mono" opacity="0.7">CLK</text>
      <text x="3" y="14" fontSize="5" fill={c} fontFamily="JetBrains Mono" opacity="0.7">SDA</text>
    </svg>
  )

  if (toolId === 'rtl') return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <rect x="3" y="4" width="22" height="20" rx="2" stroke={c} strokeWidth="1.2" fill={`${c}08`}/>
      <line x1="3" y1="9" x2="25" y2="9" stroke={c} strokeWidth="0.8" strokeOpacity="0.4"/>
      <text x="6" y="7.5" fontSize="4" fill={c} fontFamily="JetBrains Mono" opacity="0.6">module</text>
      <text x="6" y="14" fontSize="4.5" fill={c} fontFamily="JetBrains Mono">assign</text>
      <text x="6" y="18.5" fontSize="4.5" fill={c} fontFamily="JetBrains Mono" opacity="0.7">always</text>
      <text x="6" y="23" fontSize="4.5" fill={c} fontFamily="JetBrains Mono" opacity="0.5">endmod</text>
      <rect x="18" y="11" width="5" height="3" rx="0.5" fill={`${c}30`} stroke={c} strokeWidth="0.5"/>
    </svg>
  )

  if (toolId === 'timing') return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke={c} strokeWidth="1.2" fill={`${c}08`}/>
      <line x1="14" y1="14" x2="14" y2="7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="14" x2="19" y2="17" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="1.5" fill={c}/>
      <line x1="14" y1="4" x2="14" y2="5.5" stroke={c} strokeWidth="1"/>
      <line x1="24" y1="14" x2="22.5" y2="14" stroke={c} strokeWidth="1"/>
      <line x1="4" y1="14" x2="5.5" y2="14" stroke={c} strokeWidth="1"/>
      <line x1="14" y1="24" x2="14" y2="22.5" stroke={c} strokeWidth="1"/>
      <path d="M8 20 Q11 17 14 14" stroke={c} strokeWidth="0.8" strokeOpacity="0.4" fill="none" strokeDasharray="1.5,1.5"/>
    </svg>
  )

  if (toolId === 'fault') return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <rect x="4" y="6" width="20" height="16" rx="2" stroke={c} strokeWidth="1.2" fill={`${c}08`}/>
      <line x1="8" y1="6" x2="8" y2="4" stroke={c} strokeWidth="1"/>
      <line x1="12" y1="6" x2="12" y2="4" stroke={c} strokeWidth="1"/>
      <line x1="16" y1="6" x2="16" y2="4" stroke={c} strokeWidth="1"/>
      <line x1="20" y1="6" x2="20" y2="4" stroke={c} strokeWidth="1"/>
      <line x1="8" y1="22" x2="8" y2="24" stroke={c} strokeWidth="1"/>
      <line x1="16" y1="22" x2="16" y2="24" stroke={c} strokeWidth="1"/>
      {/* Lightning bolt = fault */}
      <path d="M15 9 L11 15 L14 15 L13 19 L17 13 L14 13 Z" fill={`${c}40`} stroke={c} strokeWidth="0.8"/>
    </svg>
  )

  if (toolId === 'component') return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <rect x="7" y="6" width="14" height="16" rx="1.5" stroke={c} strokeWidth="1.2" fill={`${c}10`}/>
      {/* Left pins */}
      <line x1="3" y1="10" x2="7" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="3" y1="14" x2="7" y2="14" stroke={c} strokeWidth="1.2"/>
      <line x1="3" y1="18" x2="7" y2="18" stroke={c} strokeWidth="1.2"/>
      {/* Right pins */}
      <line x1="21" y1="10" x2="25" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="21" y1="14" x2="25" y2="14" stroke={c} strokeWidth="1.2"/>
      <line x1="21" y1="18" x2="25" y2="18" stroke={c} strokeWidth="1.2"/>
      {/* IC label */}
      <text x="10" y="16" fontSize="5" fill={c} fontFamily="JetBrains Mono" fontWeight="bold">IC</text>
      <circle cx="9.5" cy="8" r="1" fill={c} opacity="0.6"/>
    </svg>
  )

  return <div style={{ width: s, height: s }} />
}

const TOOL_DESCRIPTIONS = {
  schematic: 'NL → SPICE netlist + BOM',
  protocol:  'SPI / I2C / AXI decode',
  rtl:       'Verilog / VHDL codegen',
  timing:    'SDC constraint advisor',
  fault:     'Stuck-at / Bridging / TDF',
  component: 'IC part recommendations',
}

export default function Sidebar({ tools, activeTool, onSelectTool, apiKey, onApiKeyChange }) {
  const [showKey, setShowKey] = useState(false)
  const [editing, setEditing] = useState(!apiKey)
  const [localKey, setLocalKey] = useState(apiKey)

  const handleSave = () => {
    onApiKeyChange(localKey.trim())
    setEditing(false)
  }

  const pType  = detectProvider(apiKey)
  const pName  = providerLabel(apiKey)
  const pColor = providerColor(apiKey)
  const keyValid = pType !== 'unknown' && (apiKey || '').length > 8

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen glass glass-border relative z-10">

      {/* Brand header */}
      <div className="px-5 pt-5 pb-4 border-b border-scope-border/60">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-scope-green/10 border border-scope-green/30 flex items-center justify-center neon-border-green">
              <Zap size={16} className="text-scope-green" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-scope-green pulse-dot border-2 border-scope-bg" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-widest gradient-text">CIRCUITSENSE</h1>
            <p className="font-mono text-[9px] text-scope-dim tracking-wider">AI VLSI INTELLIGENCE · v1.0</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <span className="badge border"
            style={{ background: `${pColor}10`, color: pColor, borderColor: `${pColor}20` }}>
            {pType.toUpperCase()}
          </span>
          <span className="badge bg-scope-cyan/10 text-scope-cyan border border-scope-cyan/20">AGENT READY</span>
        </div>
      </div>

      {/* Tool navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <p className="font-mono text-[9px] text-scope-muted tracking-widest uppercase px-3 pb-2 pt-1">
          ▸ Analysis Modules
        </p>
        {tools.map(t => {
          const isActive = activeTool?.id === t.id
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t)}
              className={`tool-card w-full flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all ${isActive ? 'active' : ''}`}
              style={{
                '--accent': t.accent,
                '--accent-rgb': t.accent.slice(1).match(/../g)?.map(h => parseInt(h, 16)).join(','),
                background: isActive ? `${t.accent}0d` : 'transparent',
              }}
            >
              {/* VLSI SVG icon */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all"
                style={{
                  width: 36,
                  height: 36,
                  background: isActive ? `${t.accent}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? t.accent + '40' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isActive ? `0 0 10px ${t.accent}25` : 'none',
                }}
              >
                <ToolSVG toolId={t.id} color={isActive ? t.accent : '#546e7a'} size={22} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 text-left">
                <p className={`font-mono text-[11px] font-semibold truncate transition-colors ${isActive ? 'text-scope-text' : 'text-scope-dim group-hover:text-scope-text'}`}
                  style={{ color: isActive ? t.accent : undefined }}>
                  {t.label}
                </p>
                <p className="font-mono text-[9px] text-scope-muted truncate mt-0.5">
                  {TOOL_DESCRIPTIONS[t.id]}
                </p>
              </div>

              {/* Active pulse dot */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.accent, boxShadow: `0 0 6px ${t.accent}` }} />
              )}
            </button>
          )
        })}
      </div>

      {/* API Key section */}
      <div className="p-4 border-t border-scope-border/60">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[9px] text-scope-muted uppercase tracking-widest">{pName} Key</span>
          {keyValid && (
            <span className="badge border" style={{ color: pColor, borderColor: `${pColor}40`, background: `${pColor}10` }}>ACTIVE</span>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={e => setLocalKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Enter API Key..."
                className="flex-1 bg-scope-bg/80 border border-scope-border rounded px-2.5 py-2 font-mono text-[11px] text-scope-text placeholder-scope-muted min-w-0 focus:border-scope-green/40 transition-colors"
              />
              <button onClick={() => setShowKey(v => !v)} className="text-scope-dim hover:text-scope-text p-1.5 transition-colors">
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {localKey?.length > 8 && (
              <button onClick={handleSave}
                className="w-full font-mono text-[11px] py-1.5 rounded transition-all text-scope-green border border-scope-green/30"
                style={{ background: 'rgba(0,255,136,0.08)' }}>
                ✓ Save Key
              </button>
            )}
            <div className="flex flex-col gap-1 mt-2">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                className="font-mono text-[9px] text-scope-dim hover:text-scope-cyan transition-colors flex items-center justify-center gap-1">
                Gemini (Free) <ExternalLink size={8}/>
              </a>
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer"
                className="font-mono text-[9px] text-scope-dim hover:text-scope-amber transition-colors flex items-center justify-center gap-1">
                Groq (Free) <ExternalLink size={8}/>
              </a>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all hover:border-scope-green/30"
            style={{ background: 'rgba(0,255,136,0.04)', borderColor: 'rgba(0,255,136,0.15)' }}
            onClick={() => setEditing(true)}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-scope-green pulse-dot" />
            <span className="font-mono text-[11px] text-scope-dim flex-1 truncate">
              {(apiKey || '').slice(0, 8)}••••••••
            </span>
            <span className="font-mono text-[10px] text-scope-dim hover:text-scope-text">edit</span>
          </div>
        )}
      </div>

      {/* Bottom status */}
      <div className="px-4 pb-4">
        <div className="text-[9px] font-mono text-scope-muted">VLSI AI · Silicon Intelligence</div>
      </div>
    </aside>
  )
}

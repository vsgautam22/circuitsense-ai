import { Cpu, Activity, Code2, Timer, Bug, Package, Zap, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { detectProvider, providerLabel, providerColor } from '../lib/claudeClient.js'

const iconMap = { Cpu, Activity, Code2, Timer, Bug, Package }

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
  const [localKey, setLocalKey]   = useState(apiKey)

  const handleSave = () => {
    onApiKeyChange(localKey.trim())
    setEditing(false)
  }

  const pType = detectProvider(apiKey)
  const pName = providerLabel(apiKey)
  const pColor = providerColor(apiKey)
  const keyValid = pType !== 'unknown' && apiKey.length > 8

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen glass glass-border relative z-10">

      {/* ── Brand header ── */}
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

        {/* Status chips */}
        <div className="flex gap-2 mt-3">
          <span 
            className="badge border" 
            style={{ 
              background: `${pColor}10`, 
              color: pColor, 
              borderColor: `${pColor}20` 
            }}
          >
            {pType.toUpperCase()}
          </span>
          <span className="badge bg-scope-cyan/10 text-scope-cyan border border-scope-cyan/20">AGENT READY</span>
        </div>
      </div>

      {/* ── Tool navigation ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <p className="font-mono text-[9px] text-scope-muted tracking-widest uppercase px-3 pb-2 pt-1">
          ▸ Analysis Modules
        </p>
        {tools.map(t => {
          const Icon = iconMap[t.icon] || Cpu
          const isActive = activeTool?.id === t.id
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t)}
              className={`tool-card w-full flex items-center gap-3 px-3 py-3 rounded-lg group ${isActive ? 'active' : ''}`}
              style={{ '--accent': t.accent, '--accent-rgb': t.accent.slice(1).match(/../g)?.map(h => parseInt(h, 16)).join(',') }}
            >
              {/* Left accent bar handled by CSS .tool-card::before */}

              {/* Icon */}
              <div
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  background: isActive ? `${t.accent}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? t.accent + '40' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isActive ? `0 0 8px ${t.accent}30` : 'none',
                }}
              >
                <Icon size={13} style={{ color: isActive ? t.accent : '#6b8499' }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 text-left">
                <p className={`font-mono text-[11px] font-semibold truncate transition-colors ${isActive ? 'text-scope-text' : 'text-scope-dim group-hover:text-scope-text'}`}>
                  {t.label}
                </p>
                <p className="font-mono text-[9px] text-scope-muted truncate mt-0.5">
                  {TOOL_DESCRIPTIONS[t.id]}
                </p>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="flex-shrink-0">
                  <svg width="6" height="6" viewBox="0 0 6 6">
                    <circle cx="3" cy="3" r="3" fill={t.accent} />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── API Key section ── */}
      <div className="p-4 border-t border-scope-border/60">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[9px] text-scope-muted uppercase tracking-widest">
            {pName} Key
          </span>
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
            {localKey.length > 8 && (
              <button
                onClick={handleSave}
                className="w-full font-mono text-[11px] py-1.5 rounded transition-all text-scope-green border border-scope-green/30"
                style={{ background: 'rgba(0,255,136,0.08)' }}
              >
                ✓ Save Key
              </button>
            )}
            <div className="flex flex-col gap-1 mt-2">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="font-mono text-[9px] text-scope-dim hover:text-scope-cyan transition-colors flex items-center justify-center gap-1">Gemini (Free) <ExternalLink size={8}/></a>
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="font-mono text-[9px] text-scope-dim hover:text-scope-amber transition-colors flex items-center justify-center gap-1">Groq (Free) <ExternalLink size={8}/></a>
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
              {apiKey.slice(0, 8)}••••••••
            </span>
            <span className="font-mono text-[10px] text-scope-dim hover:text-scope-text">edit</span>
          </div>
        )}
      </div>

      {/* ── Bottom status ── */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <div className="text-[9px] font-mono text-scope-muted">
          VLSI AI · Silicon Intelligence
        </div>
      </div>
    </aside>
  )
}

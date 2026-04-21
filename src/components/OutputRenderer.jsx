import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const SECTION_RE = /===([^=]+)===/g

function parseOutput(text) {
  const segments = []
  let lastIndex = 0
  let match
  SECTION_RE.lastIndex = 0

  while ((match = SECTION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const pre = text.slice(lastIndex, match.index).trim()
      if (pre) segments.push({ type: 'text', content: pre })
    }
    const title = match[1].trim()
    const start = SECTION_RE.lastIndex
    const next = text.indexOf('===', start)
    const content = (next === -1 ? text.slice(start) : text.slice(start, next)).trim()
    segments.push({ type: 'section', title, content })
    lastIndex = next === -1 ? text.length : next
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim()
    if (remaining) segments.push({ type: 'text', content: remaining })
  }

  return segments.length ? segments : [{ type: 'text', content: text }]
}

function renderContent(content, accent) {
  const codeBlockRe = /```([\w]*)\n?([\s\S]*?)```/g
  const parts = []
  let last = 0
  let m

  while ((m = codeBlockRe.exec(content)) !== null) {
    if (m.index > last) {
      const rawText = content.slice(last, m.index)
      parts.push(<TextBlock key={last} text={rawText} accent={accent} />)
    }
    parts.push(
      <CodeBlock key={m.index} lang={m[1]} code={m[2].trimEnd()} accent={accent} />
    )
    last = codeBlockRe.lastIndex
  }
  if (last < content.length) {
    parts.push(<TextBlock key={last} text={content.slice(last)} accent={accent} />)
  }
  return parts
}

function TextBlock({ text, accent }) {
  if (!text.trim()) return null

  // Detect ASCII diagram/schematic block (contains box-drawing chars, circuit symbols, or indented art)
  const looksLikeDiagram = (
    (text.includes('──') || text.includes('│') || text.includes('┌') || text.includes('└')) ||
    (text.includes('|') && text.includes('+') && text.split('\n').filter(l => l.includes('|') || l.includes('-')).length >= 3) ||
    (text.includes('\/\/\/') || text.includes('-[') || text.includes(']--') || text.includes('--+--')) ||
    (text.includes('‾') && text.includes('_') && text.includes('|'))
  )

  if (looksLikeDiagram) {
    return (
      <div
        className="my-2 rounded overflow-hidden"
        style={{ border: `1px solid ${accent || '#00ff88'}25`, background: 'rgba(0,0,0,0.5)' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{ background: `${accent || '#00ff88'}08`, borderBottom: `1px solid ${accent || '#00ff88'}15` }}
        >
          <span className="font-mono text-[9px] font-bold tracking-widest" style={{ color: accent || '#00ff88' }}>
            DIAGRAM
          </span>
        </div>
        <pre
          className="p-4 m-0 overflow-x-auto font-mono text-[11px] leading-relaxed"
          style={{ color: accent || '#00ff88', background: 'transparent', border: 'none', whiteSpace: 'pre' }}
        >
          {text.trim()}
        </pre>
      </div>
    )
  }

  // Detect markdown table
  if (text.includes('|') && text.includes('\n')) {
    const lines = text.split('\n').filter(l => l.trim())
    const tableLines = lines.filter(l => l.trim().startsWith('|'))
    if (tableLines.length >= 2) {
      return <TableBlock rows={tableLines} accent={accent} />
    }
  }

  return (
    <p className="font-mono text-[12px] text-scope-dim leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  )
}



function CodeBlock({ lang, code, accent }) {
  const [copied, setCopied] = React.useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const langColors = {
    verilog: '#a855f7', vhdl: '#a855f7', systemverilog: '#a855f7',
    tcl: '#ffab40', sdc: '#ffab40', python: '#00d4ff',
    spice: '#00ff88', netlist: '#00ff88',
  }
  const langColor = langColors[lang?.toLowerCase()] || accent || '#00ff88'
  return (
    <div className="my-2 rounded-md overflow-hidden" style={{ border: `1px solid ${langColor}20`, background: 'rgba(0,0,0,0.45)' }}>
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ background: `${langColor}08`, borderBottom: `1px solid ${langColor}15` }}
      >
        <span className="font-mono text-[9px] font-bold tracking-widest" style={{ color: langColor }}>
          {lang?.toUpperCase() || 'CODE'}
        </span>
        <button
          onClick={copy}
          className="font-mono text-[9px] transition-colors"
          style={{ color: copied ? '#00ff88' : '#6b8499' }}
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto m-0" style={{ border: 'none', background: 'transparent' }}>
        <code className="font-mono text-[11px] text-scope-text leading-relaxed">{code}</code>
      </pre>
    </div>
  )
}

function TableBlock({ rows, accent }) {
  const headers = rows[0].split('|').filter(Boolean).map(s => s.trim())
  const dataRows = rows.slice(2).map(r => r.split('|').filter(Boolean).map(s => s.trim()))
  return (
    <div className="my-2 overflow-x-auto rounded" style={{ border: `1px solid rgba(255,255,255,0.06)` }}>
      <table className="w-full font-mono text-[11px]">
        <thead>
          <tr style={{ background: `${accent || '#00ff88'}0a`, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold" style={{ color: accent || '#00ff88' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: ri % 2 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-scope-dim">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({ seg, accent, index }) {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="output-section fade-in">
      <button
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors hover:opacity-80"
        style={{ background: `${accent || '#00ff88'}08`, borderBottom: open ? `1px solid rgba(255,255,255,0.05)` : 'none' }}
        onClick={() => setOpen(v => !v)}
      >
        <ChevronRight size={10} className="flex-shrink-0 transition-transform" style={{ color: accent, transform: open ? 'rotate(90deg)' : 'none' }} />
        <span className="font-mono text-[10px] font-bold tracking-wider uppercase flex-1" style={{ color: accent || '#00ff88' }}>
          {seg.title}
        </span>
        <span className="font-mono text-[9px] text-scope-muted">
          {String(index + 1).padStart(2, '0')}
        </span>
      </button>
      {open && (
        <div className="p-4 space-y-2">
          {renderContent(seg.content, accent)}
        </div>
      )}
    </div>
  )
}

export default function OutputRenderer({ output, accentColor }) {
  if (!output) return null
  const segments = parseOutput(output)

  return (
    <div className="space-y-3 fade-in" style={{ '--accent': accentColor }}>
      {segments.map((seg, i) =>
        seg.type === 'section'
          ? <Section key={i} seg={seg} accent={accentColor} index={i} />
          : (
            <div key={i} className="px-1 space-y-2">
              {renderContent(seg.content, accentColor)}
            </div>
          )
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { History, Trash2, RotateCcw, Clock } from 'lucide-react'

const MAX_HISTORY = 50
const STORAGE_KEY = (toolId) => `cs_history_${toolId}`

function loadHistory(toolId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(toolId))
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

export function saveToHistory(toolId, entry) {
  try {
    const existing = loadHistory(toolId)
    const updated = [entry, ...existing].slice(0, MAX_HISTORY)
    localStorage.setItem(STORAGE_KEY(toolId), JSON.stringify(updated))
    return updated
  } catch {}
  return []
}

function HistoryItem({ item, index, accent, onReuse, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
  const shortPrompt = item.prompt.length > 55 ? item.prompt.slice(0, 55) + '…' : item.prompt

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        border: `1px solid rgba(255,255,255,0.04)`,
        background: expanded ? `${accent}06` : 'rgba(255,255,255,0.015)',
      }}
    >
      <div className="flex items-start gap-2 px-3 py-2">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(v => !v)}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock size={8} style={{ color: accent, opacity: 0.7 }} />
            <span className="font-mono text-[8px] text-scope-muted">{dateStr} {timeStr}</span>
          </div>
          <p className="font-mono text-[10px] text-scope-dim leading-snug">{shortPrompt}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0 mt-0.5">
          <button
            onClick={() => onReuse(item.prompt)}
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: `${accent}15`, color: accent }}
            title="Reuse"
          >
            <RotateCcw size={8} />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(255,69,96,0.08)', color: '#ff4560' }}
            title="Delete"
          >
            <Trash2 size={8} />
          </button>
        </div>
      </div>
      {expanded && item.response && (
        <div className="px-3 pb-2 border-t" style={{ borderColor: `${accent}15` }}>
          <p className="font-mono text-[9px] text-scope-muted leading-relaxed mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap">
            {item.response.slice(0, 350)}{item.response.length > 350 ? '…' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default function HistoryPanel({ tool, onReuse, newEntry }) {
  const [history, setHistory] = useState([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    if (tool) setHistory(loadHistory(tool.id))
  }, [tool?.id])

  useEffect(() => {
    if (newEntry && tool) {
      const updated = saveToHistory(tool.id, newEntry)
      setHistory(updated)
    }
  }, [newEntry])

  const handleDelete = idx => {
    const updated = history.filter((_, i) => i !== idx)
    setHistory(updated)
    if (tool) localStorage.setItem(STORAGE_KEY(tool.id), JSON.stringify(updated))
  }

  const handleClearAll = () => {
    setHistory([])
    if (tool) localStorage.removeItem(STORAGE_KEY(tool.id))
    setShowClearConfirm(false)
  }

  const accent = tool?.accent || '#00ff88'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${accent}15`, background: `${accent}05` }}
      >
        <div className="flex items-center gap-2">
          <History size={11} style={{ color: accent }} />
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase" style={{ color: accent }}>
            History
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          showClearConfirm ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[8px] text-scope-muted">Clear all?</span>
              <button onClick={handleClearAll} className="font-mono text-[8px] text-scope-red">Yes</button>
              <button onClick={() => setShowClearConfirm(false)} className="font-mono text-[8px] text-scope-dim ml-1">No</button>
            </div>
          ) : (
            <button onClick={() => setShowClearConfirm(true)}
              className="font-mono text-[9px] text-scope-muted hover:text-scope-red transition-colors">
              clear
            </button>
          )
        )}
      </div>

      {/* Scrollable list */}
      <div
        className="flex-1 p-2.5 space-y-1.5"
        style={{
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${accent}40 transparent`,
        }}
      >
        {history.length === 0 ? (
          <div className="text-center py-5">
            <History size={16} className="mx-auto mb-1.5 opacity-20" style={{ color: accent }} />
            <p className="font-mono text-[9px] text-scope-muted">No history yet</p>
            <p className="font-mono text-[8px] text-scope-muted opacity-60 mt-0.5">Queries appear here</p>
          </div>
        ) : (
          history.map((item, i) => (
            <HistoryItem key={i} item={item} index={i} accent={accent} onReuse={onReuse} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  )
}

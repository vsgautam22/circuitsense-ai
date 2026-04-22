import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, BookOpen } from 'lucide-react'

const MAX_EXAMPLES = 25
const STORAGE_KEY = (toolId) => `cs_examples_${toolId}`

function loadExamples(toolId, defaults = []) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(toolId))
    if (stored) return JSON.parse(stored)
  } catch {}
  return defaults.slice(0, MAX_EXAMPLES)
}

function saveExamples(toolId, examples) {
  try { localStorage.setItem(STORAGE_KEY(toolId), JSON.stringify(examples)) } catch {}
}

function ExampleItem({ text, index, accent, onSelect, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const shortText = text.length > 70 ? text.slice(0, 70) + '…' : text

  return (
    <div
      className="group relative rounded-lg transition-all duration-150 cursor-pointer"
      style={{
        border: `1px solid rgba(255,255,255,0.04)`,
        background: hovered ? `${accent}09` : 'rgba(255,255,255,0.02)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-2.5 px-3 py-2.5" onClick={() => onSelect(text)}>
        <span
          className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
          style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}25` }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="font-mono text-[10px] text-scope-dim leading-relaxed flex-1">{shortText}</p>
      </div>

      {hovered && (
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          <button
            onClick={e => { e.stopPropagation(); onEdit(index) }}
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#6b8499' }}
          >
            <Pencil size={9} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(index) }}
            className="w-5 h-5 rounded flex items-center justify-center hover:text-scope-red"
            style={{ background: 'rgba(255,69,96,0.06)', color: '#6b8499' }}
          >
            <Trash2 size={9} />
          </button>
        </div>
      )}
    </div>
  )
}

function EditItem({ text, index, accent, onSave, onCancel }) {
  const [val, setVal] = useState(text)
  return (
    <div className="rounded-lg p-2 space-y-2" style={{ border: `1px solid ${accent}30`, background: `${accent}06` }}>
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        rows={3}
        autoFocus
        className="w-full bg-transparent font-mono text-[10px] text-scope-text leading-relaxed resize-none outline-none"
        placeholder="Enter example query..."
      />
      <div className="flex gap-1.5 justify-end">
        <button onClick={onCancel} className="flex items-center gap-1 px-2 py-1 rounded font-mono text-[9px] text-scope-dim"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <X size={9} /> Cancel
        </button>
        <button onClick={() => val.trim() && onSave(index, val.trim())} disabled={!val.trim()}
          className="flex items-center gap-1 px-2 py-1 rounded font-mono text-[9px]"
          style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}>
          <Check size={9} /> Save
        </button>
      </div>
    </div>
  )
}

export default function ExamplesPanel({ tool, onSelect }) {
  const [examples, setExamples] = useState([])
  const [editingIdx, setEditingIdx] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!tool) return
    setExamples(loadExamples(tool.id, tool.examples || []))
    setEditingIdx(null)
    setAdding(false)
  }, [tool?.id])

  const persist = updated => {
    setExamples(updated)
    if (tool) saveExamples(tool.id, updated)
  }

  const handleSave = (idx, value) => {
    const updated = [...examples]
    if (idx === -1) updated.push(value)
    else updated[idx] = value
    persist(updated)
    setEditingIdx(null)
    setAdding(false)
  }

  const handleDelete = idx => {
    persist(examples.filter((_, i) => i !== idx))
    if (editingIdx === idx) setEditingIdx(null)
  }

  const accent = tool?.accent || '#00ff88'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${accent}18`, background: `${accent}06` }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={11} style={{ color: accent }} />
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase" style={{ color: accent }}>
            Examples
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
            {examples.length}/{MAX_EXAMPLES}
          </span>
        </div>
        <span className="font-mono text-[9px] text-scope-muted">click to send</span>
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
        {examples.length === 0 && !adding && (
          <div className="text-center py-6">
            <p className="font-mono text-[10px] text-scope-muted">No examples yet.</p>
            <p className="font-mono text-[9px] text-scope-muted opacity-60 mt-1">Add one below ↓</p>
          </div>
        )}

        {examples.map((ex, i) =>
          editingIdx === i ? (
            <EditItem key={i} text={ex} index={i} accent={accent} onSave={handleSave} onCancel={() => setEditingIdx(null)} />
          ) : (
            <ExampleItem key={i} text={ex} index={i} accent={accent} onSelect={onSelect} onEdit={setEditingIdx} onDelete={handleDelete} />
          )
        )}

        {adding && (
          <EditItem key="new" text="" index={-1} accent={accent} onSave={handleSave} onCancel={() => setAdding(false)} />
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {examples.length < MAX_EXAMPLES ? (
          <button
            onClick={() => { setAdding(true); setEditingIdx(null) }}
            disabled={adding}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg font-mono text-[10px] transition-all"
            style={{
              background: adding ? 'rgba(255,255,255,0.02)' : `${accent}0a`,
              border: `1px solid ${adding ? 'rgba(255,255,255,0.04)' : accent + '25'}`,
              color: adding ? '#3a4552' : accent,
            }}
          >
            <Plus size={11} /> Add Example ({MAX_EXAMPLES - examples.length} left)
          </button>
        ) : (
          <p className="font-mono text-[9px] text-scope-muted text-center">Max {MAX_EXAMPLES} reached</p>
        )}
      </div>
    </div>
  )
}

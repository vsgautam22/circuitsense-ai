import React, { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Plus, Pencil, Trash2, Check, X, BookOpen } from 'lucide-react'

const MAX_EXAMPLES = 10
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

function ExampleItem({ text, index, accent, onSelect, onEdit, onDelete, isDefault }) {
  const [hovered, setHovered] = useState(false)
  const shortText = text.length > 72 ? text.slice(0, 72) + '…' : text

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
      {/* Index badge + text */}
      <div className="flex items-start gap-2.5 px-3 py-2.5" onClick={() => onSelect(text)}>
        <span
          className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
          style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}25` }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="font-mono text-[10px] text-scope-dim leading-relaxed flex-1">
          {shortText}
        </p>
      </div>

      {/* Hover action buttons */}
      {hovered && (
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(index) }}
            className="w-5 h-5 rounded flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#6b8499' }}
            title="Edit"
          >
            <Pencil size={9} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(index) }}
            className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:text-scope-red"
            style={{ background: 'rgba(255,69,96,0.06)', color: '#6b8499' }}
            title="Delete"
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
        className="w-full bg-transparent font-mono text-[10px] text-scope-text leading-relaxed resize-none outline-none placeholder-scope-muted"
        placeholder="Enter your example query..."
      />
      <div className="flex gap-1.5 justify-end">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-2 py-1 rounded font-mono text-[9px] text-scope-dim hover:text-scope-text transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <X size={9} /> Cancel
        </button>
        <button
          onClick={() => val.trim() && onSave(index, val.trim())}
          disabled={!val.trim()}
          className="flex items-center gap-1 px-2 py-1 rounded font-mono text-[9px] transition-colors"
          style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}
        >
          <Check size={9} /> Save
        </button>
      </div>
    </div>
  )
}

export default function ExamplesPanel({ tool, onSelect }) {
  const [open, setOpen]       = useState(true)
  const [examples, setExamples] = useState([])
  const [editingIdx, setEditingIdx] = useState(null)
  const [adding, setAdding]   = useState(false)

  // Load examples whenever tool changes
  useEffect(() => {
    if (!tool) return
    setExamples(loadExamples(tool.id, tool.examples || []))
    setEditingIdx(null)
    setAdding(false)
  }, [tool?.id])

  const persist = (updated) => {
    setExamples(updated)
    if (tool) saveExamples(tool.id, updated)
  }

  const handleSave = (idx, value) => {
    const updated = [...examples]
    if (idx === -1) {
      updated.push(value) // new item
    } else {
      updated[idx] = value // edit existing
    }
    persist(updated)
    setEditingIdx(null)
    setAdding(false)
  }

  const handleDelete = (idx) => {
    const updated = examples.filter((_, i) => i !== idx)
    persist(updated)
    if (editingIdx === idx) setEditingIdx(null)
  }

  const accent = tool?.accent || '#00ff88'

  return (
    <div className="relative flex flex-shrink-0" style={{ width: open ? 280 : 0 }}>

      {/* Toggle tab on left edge */}
      <button
        onClick={() => setOpen(v => !v)}
        className="absolute -left-7 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 rounded-l-lg transition-all"
        style={{
          height: 72,
          background: open ? `${accent}15` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? accent + '30' : 'rgba(255,255,255,0.06)'}`,
          borderRight: 'none',
          color: open ? accent : '#6b8499',
        }}
        title={open ? 'Hide examples' : 'Show examples'}
      >
        <div className="flex flex-col items-center gap-1">
          {open ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
          <BookOpen size={10} />
          {!open && (
            <span
              className="font-mono text-[8px] font-bold"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 1 }}
            >
              EX
            </span>
          )}
        </div>
      </button>

      {/* Panel body */}
      {open && (
        <div
          className="w-70 flex flex-col h-full overflow-hidden"
          style={{
            width: 280,
            background: 'rgba(6,10,14,0.88)',
            borderLeft: `1px solid rgba(255,255,255,0.05)`,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${accent}18`, background: `${accent}06` }}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={12} style={{ color: accent }} />
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase" style={{ color: accent }}>
                Examples
              </span>
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}
              >
                {examples.length}/{MAX_EXAMPLES}
              </span>
            </div>
            <span className="font-mono text-[9px] text-scope-muted">click to send</span>
          </div>

          {/* Example list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {examples.length === 0 && !adding && (
              <div className="text-center py-8 space-y-2">
                <p className="font-mono text-[10px] text-scope-muted">No examples yet.</p>
                <p className="font-mono text-[9px] text-scope-muted opacity-60">Add one below ↓</p>
              </div>
            )}

            {examples.map((ex, i) =>
              editingIdx === i ? (
                <EditItem
                  key={i}
                  text={ex}
                  index={i}
                  accent={accent}
                  onSave={handleSave}
                  onCancel={() => setEditingIdx(null)}
                />
              ) : (
                <ExampleItem
                  key={i}
                  text={ex}
                  index={i}
                  accent={accent}
                  onSelect={onSelect}
                  onEdit={setEditingIdx}
                  onDelete={handleDelete}
                />
              )
            )}

            {/* New example editor */}
            {adding && (
              <EditItem
                key="new"
                text=""
                index={-1}
                accent={accent}
                onSave={handleSave}
                onCancel={() => setAdding(false)}
              />
            )}
          </div>

          {/* Footer: add button */}
          <div
            className="flex-shrink-0 p-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            {examples.length < MAX_EXAMPLES ? (
              <button
                onClick={() => { setAdding(true); setEditingIdx(null) }}
                disabled={adding}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-[10px] transition-all"
                style={{
                  background: adding ? 'rgba(255,255,255,0.02)' : `${accent}0a`,
                  border: `1px solid ${adding ? 'rgba(255,255,255,0.04)' : accent + '25'}`,
                  color: adding ? '#3a4552' : accent,
                }}
              >
                <Plus size={11} />
                Add Example ({MAX_EXAMPLES - examples.length} left)
              </button>
            ) : (
              <p className="font-mono text-[9px] text-scope-muted text-center">
                Max {MAX_EXAMPLES} examples reached
              </p>
            )}
            <p className="font-mono text-[8px] text-scope-muted text-center mt-2 opacity-60">
              Examples saved per module
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

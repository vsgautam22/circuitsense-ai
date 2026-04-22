import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2, Copy, CheckCheck, Cpu, Activity, Code2, Timer, Bug, Package, FileCode, MessageSquare } from 'lucide-react'
import { callClaude } from '../lib/claudeClient.js'
import OutputRenderer from './OutputRenderer.jsx'
import SchematicRenderer from './SchematicRenderer.jsx'

const iconMap = { Cpu, Activity, Code2, Timer, Bug, Package }

function ToolBanner({ tool }) {
  const Icon = iconMap[tool.icon] || Cpu
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 flex-shrink-0 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${tool.accent}10 0%, transparent 60%), rgba(8,13,20,0.6)`,
        borderBottom: `1px solid ${tool.accent}20`,
      }}
    >
      <div className="chip-corner chip-corner-tl" style={{ borderColor: `${tool.accent}30` }} />
      <div className="chip-corner chip-corner-br" style={{ borderColor: `${tool.accent}30` }} />
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${tool.accent}15`, border: `1px solid ${tool.accent}35`, boxShadow: `0 0 12px ${tool.accent}20` }}
      >
        <Icon size={15} style={{ color: tool.accent }} />
      </div>
      <div>
        <h2 className="font-mono text-[12px] font-bold tracking-wide" style={{ color: tool.accent }}>
          {tool.label.toUpperCase()}
        </h2>
        <p className="font-mono text-[9px] text-scope-dim mt-0.5">
          {tool.id === 'schematic' && 'NL Prompt + HDL Code → Visual SVG Schematic'}
          {tool.id === 'protocol'  && 'SPI · I2C · UART · AXI-Lite Signal Analysis'}
          {tool.id === 'rtl'       && 'Verilog / SystemVerilog / VHDL Code Generation'}
          {tool.id === 'timing'    && 'SDC Constraints · STA · Timing Closure'}
          {tool.id === 'fault'     && 'Stuck-at · Bridging · Transition Fault Models'}
          {tool.id === 'component' && 'IC Part Selection · Datasheet · BOM'}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: tool.accent }} />
        <span className="font-mono text-[9px]" style={{ color: tool.accent }}>READY</span>
      </div>
    </div>
  )
}

function EmptyState({ tool, inputMode }) {
  const Icon = iconMap[tool.icon] || Cpu
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center scan-line"
          style={{ background: `${tool.accent}08`, border: `1px solid ${tool.accent}25`, boxShadow: `0 0 24px ${tool.accent}12` }}
        >
          <Icon size={26} style={{ color: tool.accent, opacity: 0.6 }} />
        </div>
        <div>
          <p className="font-mono text-sm font-semibold text-scope-dim mb-1">
            {tool.id === 'schematic' ? `Schematic Generator — ${inputMode === 'hdl' ? 'HDL Mode' : 'Prompt Mode'}` : `${tool.label} ready`}
          </p>
          {tool.id === 'schematic' && (
            <p className="font-mono text-[10px] text-scope-muted leading-relaxed">
              {inputMode === 'hdl'
                ? 'Paste Verilog / SystemVerilog / VHDL code.\nThe engine will synthesize and render the gate-level schematic.'
                : 'Describe your circuit in natural language.\nThe AI will generate a visual SVG schematic with proper symbols.'}
            </p>
          )}
        </div>
        <div
          className="text-left rounded p-3 font-mono text-[9px] text-scope-muted"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="text-scope-green">$</span> awaiting_input<span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  )
}

function SchematicMessage({ content, accent }) {
  const [view, setView] = useState('schematic')
  
  // Try to parse JSON for SVG render
  const jsonMatch = content.match(/```json\n?([\s\S]*?)```/)
  let schematicData = null
  let parseError = null
  
  if (jsonMatch) {
    try {
      schematicData = JSON.parse(jsonMatch[1].trim())
    } catch (e) {
      parseError = e.message
    }
  }

  return (
    <div className="w-full space-y-3 fade-in">
      {/* View toggle */}
      {schematicData && (
        <div className="flex gap-1 mb-2">
          {['schematic', 'netlist', 'notes'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="font-mono text-[9px] px-3 py-1 rounded transition-all capitalize"
              style={{
                background: view === v ? `${accent}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${view === v ? accent + '40' : 'rgba(255,255,255,0.06)'}`,
                color: view === v ? accent : '#6b8499',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {view === 'schematic' && schematicData && (
        <SchematicRenderer data={schematicData} title={schematicData.title} accent={accent} />
      )}

      {view === 'netlist' && schematicData?.netlist && (
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${accent}20`, background: 'rgba(0,0,0,0.5)' }}>
          <div className="px-4 py-2 font-mono text-[9px] font-bold" style={{ color: accent, borderBottom: `1px solid ${accent}15`, background: `${accent}08` }}>
            SPICE NETLIST
          </div>
          <pre className="p-4 font-mono text-[11px] text-scope-text overflow-x-auto m-0" style={{ background: 'transparent' }}>
            {schematicData.netlist}
          </pre>
        </div>
      )}

      {view === 'notes' && schematicData?.notes && (
        <div className="rounded-lg p-4" style={{ border: `1px solid ${accent}15`, background: `${accent}05` }}>
          <p className="font-mono text-[11px] text-scope-dim leading-relaxed whitespace-pre-wrap">{schematicData.notes}</p>
        </div>
      )}

      {!schematicData && (
        <div>
          {parseError && (
            <div className="mb-2 px-3 py-1.5 rounded font-mono text-[9px]" style={{ background: 'rgba(255,69,96,0.08)', border: '1px solid rgba(255,69,96,0.2)', color: '#ff4560' }}>
              JSON parse error: {parseError}. Showing raw output.
            </div>
          )}
          <OutputRenderer output={content} accentColor={accent} />
        </div>
      )}
    </div>
  )
}

export default function ChatPanel({ tool, apiKey, inputText, onInputChange, onNewHistoryEntry }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inputMode, setInputMode] = useState('prompt') // 'prompt' | 'hdl'
  const [hdlCode, setHdlCode] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const isSchematic = tool?.id === 'schematic'

  useEffect(() => { setHistory([]); onInputChange(''); setHdlCode(''); setInputMode('prompt') }, [tool?.id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, loading])

  const send = async () => {
    const activeInput = inputMode === 'hdl' ? hdlCode : inputText
    if (!activeInput?.trim() || loading) return
    if (!apiKey || apiKey.length < 8) {
      setHistory(h => [...h, { role: 'error', content: 'Enter a valid API key in the sidebar.' }])
      return
    }
    const userMsg = activeInput.trim()
    if (inputMode === 'hdl') setHdlCode('')
    else onInputChange('')
    setHistory(h => [...h, { role: 'user', content: userMsg, mode: inputMode }])
    setLoading(true)
    try {
      // Use HDL-specific system prompt if in HDL mode for schematic tool
      const sysPrompt = (isSchematic && inputMode === 'hdl' && tool.hdlSystemPrompt)
        ? tool.hdlSystemPrompt
        : tool.systemPrompt
      const result = await callClaude(apiKey, sysPrompt, userMsg)
      setHistory(h => [...h, { role: 'assistant', content: result }])
      if (onNewHistoryEntry) onNewHistoryEntry({ prompt: userMsg, response: result, timestamp: Date.now() })
    } catch (e) {
      setHistory(h => [...h, { role: 'error', content: `Error: ${e.message}` }])
    }
    setLoading(false)
  }

  const handleKey = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send() }
  const copyLast = () => {
    const last = [...history].reverse().find(h => h.role === 'assistant')
    if (last) { navigator.clipboard.writeText(last.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  }

  if (!tool) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'rgba(4,7,10,0.6)' }}>
        <div className="text-center opacity-40 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full border border-scope-green/20 flex items-center justify-center scan-line">
            <div className="w-2 h-2 rounded-full bg-scope-green" />
          </div>
          <p className="font-mono text-xs text-scope-dim">Select a tool to begin</p>
        </div>
      </div>
    )
  }

  const currentInput = inputMode === 'hdl' ? hdlCode : inputText
  const currentPlaceholder = inputMode === 'hdl' ? (tool.hdlPlaceholder || 'Paste HDL code...') : tool.placeholder

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'rgba(4,7,10,0.55)' }}>
      <ToolBanner tool={tool} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto message-scroll p-5 space-y-5">
        {history.length === 0 && <EmptyState tool={tool} inputMode={inputMode} />}

        {history.map((msg, i) => (
          <div key={i} className={`flex gap-3 slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[9px]"
              style={{
                background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : `${tool.accent}15`,
                border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${tool.accent}35`,
                color: msg.role === 'user' ? '#6b8499' : tool.accent,
              }}
            >
              {msg.role === 'user' ? (msg.mode === 'hdl' ? 'HDL' : 'U') : msg.role === 'error' ? '!' : 'AI'}
            </div>
            <div className={`max-w-[90%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'user' ? (
                <div
                  className="px-4 py-3 rounded-xl rounded-tr-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
                >
                  {msg.mode === 'hdl' && (
                    <span className="font-mono text-[8px] mb-1 block" style={{ color: tool.accent }}>HDL INPUT</span>
                  )}
                  <p className="font-mono text-xs text-scope-text whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              ) : msg.role === 'error' ? (
                <div className="px-4 py-3 rounded-xl rounded-tl-sm" style={{ background: 'rgba(255,69,96,0.06)', border: '1px solid rgba(255,69,96,0.25)' }}>
                  <p className="font-mono text-xs text-scope-red whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="w-full">
                  {isSchematic
                    ? <SchematicMessage content={msg.content} accent={tool.accent} />
                    : <OutputRenderer output={msg.content} accentColor={tool.accent} />
                  }
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 slide-up">
            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${tool.accent}15`, border: `1px solid ${tool.accent}35` }}>
              <Loader2 size={11} className="animate-spin" style={{ color: tool.accent }} />
            </div>
            <div className="px-4 py-3 rounded-xl rounded-tl-sm flex items-center gap-2" style={{ background: `${tool.accent}08`, border: `1px solid ${tool.accent}20` }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: tool.accent, animation: `pulse-dot 1.4s ease-in-out ${i * 0.25}s infinite` }} />
              ))}
              <span className="font-mono text-[10px] ml-1" style={{ color: tool.accent }}>
                {isSchematic ? 'Synthesizing schematic...' : 'Analyzing...'}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 p-4" style={{ background: 'rgba(8,13,20,0.85)', borderTop: '1px solid rgba(20,32,48,0.8)', backdropFilter: 'blur(12px)' }}>

        {/* Mode tabs for Schematic Generator */}
        {isSchematic && (
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setInputMode('prompt')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] transition-all"
              style={{
                background: inputMode === 'prompt' ? `${tool.accent}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${inputMode === 'prompt' ? tool.accent + '40' : 'rgba(255,255,255,0.06)'}`,
                color: inputMode === 'prompt' ? tool.accent : '#6b8499',
              }}
            >
              <MessageSquare size={11} /> Natural Language
            </button>
            <button
              onClick={() => setInputMode('hdl')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] transition-all"
              style={{
                background: inputMode === 'hdl' ? `${tool.accent}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${inputMode === 'hdl' ? tool.accent + '40' : 'rgba(255,255,255,0.06)'}`,
                color: inputMode === 'hdl' ? tool.accent : '#6b8499',
              }}
            >
              <FileCode size={11} /> HDL → Schematic
            </button>
            {inputMode === 'hdl' && (
              <span className="ml-auto font-mono text-[9px] text-scope-muted self-center">
                Verilog · SystemVerilog · VHDL
              </span>
            )}
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMode === 'hdl' ? hdlCode : inputText}
              onChange={e => inputMode === 'hdl' ? setHdlCode(e.target.value) : onInputChange(e.target.value)}
              onKeyDown={handleKey}
              placeholder={currentPlaceholder}
              rows={inputMode === 'hdl' ? 6 : 3}
              className="w-full rounded-xl px-4 py-3 font-mono text-xs text-scope-text placeholder-scope-muted resize-none leading-relaxed transition-all"
              style={{
                background: 'rgba(4,7,10,0.8)',
                border: `1px solid ${tool.accent}18`,
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = `${tool.accent}40`; e.target.style.boxShadow = `0 0 0 2px ${tool.accent}10` }}
              onBlur={e  => { e.target.style.borderColor = `${tool.accent}18`; e.target.style.boxShadow = 'none' }}
            />
            <span className="absolute bottom-2.5 right-3 font-mono text-[9px] text-scope-muted pointer-events-none">
              ⌃↵ send
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={send}
              disabled={loading || !currentInput.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: (!currentInput.trim() || loading) ? 'rgba(255,255,255,0.04)' : `${tool.accent}18`,
                border: `1px solid ${(!currentInput.trim() || loading) ? 'rgba(255,255,255,0.06)' : tool.accent + '40'}`,
                color: (!currentInput.trim() || loading) ? '#3a4552' : tool.accent,
                boxShadow: (!currentInput.trim() || loading) ? 'none' : `0 0 12px ${tool.accent}25`,
              }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
            <button onClick={copyLast} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: copied ? '#00ff88' : '#6b8499' }}>
              {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
            </button>
            <button onClick={() => setHistory([])} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:text-scope-red" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#6b8499' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

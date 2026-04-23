import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, Loader2, Trash2, Copy, CheckCheck,
  Cpu, Code2, FileCode, Lightbulb,
} from 'lucide-react'
import { callClaude } from '../lib/claudeClient.js'
import OutputRenderer from './OutputRenderer.jsx'
import SchematicViewer from './SchematicViewer.jsx'

// ── System prompts ────────────────────────────────────────────────────────────
const SYS_NL = `You are a world-class VLSI EDA expert that generates detailed digital circuit schematic descriptions like Xilinx Vivado would show.

Given a natural language circuit description, produce ALL of these sections using ===SECTION NAME=== headers:

===HIERARCHY===
Emit a single JSON code block describing the full design hierarchy:
\`\`\`json
{
  "top": "module_name",
  "ports": {
    "inputs":  ["CLK","RST","A","B"],
    "outputs": ["Q","SUM","COUT"]
  },
  "modules": [
    { "id": "U1", "type": "DFF",  "label": "Reg_Q",    "inputs": ["D","CLK","RST"], "outputs": ["Q"] },
    { "id": "U2", "type": "AND2", "label": "gate_and", "inputs": ["A","B"],         "outputs": ["Y"] },
    { "id": "U3", "type": "XOR2", "label": "gate_xor", "inputs": ["A","B"],         "outputs": ["Y"] }
  ],
  "nets": [
    { "name": "w_and", "from": "U2.Y", "to": "U1.D" },
    { "name": "w_xor", "from": "U3.Y", "to": "U1.D" }
  ]
}
\`\`\`

Valid module types: AND2 AND3 OR2 OR3 NAND2 NOR2 XOR2 XNOR2 NOT BUF MUX2 MUX4
DFF DFFE LUT2 LUT3 LUT4 LUT5 LUT6 REG8 REG16 REG32 ADDER ALU MULT RAM BRAM IBUF OBUF

===COMPONENT LIST===
Markdown table: Instance | Type | Description | Ports (In→Out)

===NETLIST===
Structural Verilog netlist:
\`\`\`verilog
module top_name(input CLK, A, B, output Q);
  wire w1, w2;
  AND2 U1(.A(A), .B(B), .Y(w1));
  DFF  U2(.D(w1), .CLK(CLK), .Q(Q));
endmodule
\`\`\`

===TIMING ANALYSIS===
| Signal | Path Type | Slack | Frequency |
|--------|-----------|-------|-----------|
Fill with estimated values for the critical paths.

===DESIGN NOTES===
- Logic utilisation estimate (LUTs, FFs, DSPs, BRAMs)
- Critical path analysis
- Synthesis recommendations for Xilinx 7-series / UltraScale+`

const SYS_HDL = `You are a senior VLSI synthesis engineer and EDA expert. Your role is exactly like Xilinx Vivado RTL elaboration and synthesis view.

Given Verilog / SystemVerilog / VHDL source code, perform full static elaboration and produce ALL sections:

===ELABORATION REPORT===
- Top-level module name detected
- Port list (direction, width, type)
- Parameter/localparam values resolved
- Any lint warnings

===HIERARCHY===
Emit the full inferred gate-level netlist as JSON. Infer correct primitive types from HDL operators:
- assign y = a & b → AND2
- assign y = a | b → OR2
- assign y = a ^ b → XOR2
- assign y = ~a → NOT
- always @(posedge CLK) → DFF
- if/case → MUX2/MUX4
- arithmetic + → ADDER
- * → MULT
\`\`\`json
{
  "top": "module_name",
  "ports": { "inputs": ["CLK","A","B"], "outputs": ["Y","Q"] },
  "modules": [ { "id":"U1","type":"AND2","label":"and_inst","inputs":["A","B"],"outputs":["Y"] } ],
  "nets":    [ { "name":"w1","from":"U1.Y","to":"U2.A" } ]
}
\`\`\`

===RESOURCE UTILIZATION===
| Resource | Used | Available (XC7A35T) | Utilization |
|----------|------|---------------------|-------------|
| LUTs     |      | 20800               |             |
| FFs      |      | 41600               |             |
| DSPs     |      | 90                  |             |
| BRAMs    |      | 50                  |             |

===TIMING SUMMARY===
| Path | From | To | Slack | Fmax |
|------|------|----|-------|------|
Estimate synthesis-level timing.

===SYNTHESIS NETLIST===
Structural Verilog after synthesis:
\`\`\`verilog
module top_synth(...);
endmodule
\`\`\`

===DESIGN NOTES===
- Inferred latches and how to eliminate them
- Critical warnings and fixes
- Optimisation suggestions for Xilinx target`

const HDL_PLACEHOLDER = `// Paste your HDL code here — Verilog, SystemVerilog, or VHDL
// Example (Verilog):
module full_adder(
  input  a, b, cin,
  output sum, cout
);
  assign sum  = a ^ b ^ cin;
  assign cout = (a & b) | (b & cin) | (a & cin);
endmodule`

function detectHdlLang(code) {
  if (/\bentity\b|\barchitecture\b/.test(code)) return 'vhdl'
  if (/\blogic\b|\balways_ff\b/.test(code))      return 'systemverilog'
  if (/\bmodule\b|\bassign\b|\breg\b/.test(code)) return 'verilog'
  return 'hdl'
}

function ModeTab({ label, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] font-bold transition-all"
      style={{
        borderBottom: active ? '2px solid #00e676' : '2px solid transparent',
        color: active ? '#00e676' : '#546e7a',
        background: 'transparent',
      }}
    >
      <Icon size={11} />
      {label}
    </button>
  )
}

// ── Renders a single assistant message with SchematicViewer + text sections ──
function AssistantMessage({ content, accent }) {
  // Check for hierarchy JSON in the content (both ===HIERARCHY=== section and bare JSON)
  const hasHierarchy = content.includes('===HIERARCHY===') ||
    /```(?:json)?\s*\{\s*"top"/.test(content)

  // Strip the JSON code block from the content before passing to OutputRenderer
  // so it doesn't double-render as raw code inside the HIERARCHY section
  const contentForRenderer = content.replace(
    /(===HIERARCHY===[\s\S]*?)```json[\s\S]*?```/,
    '$1[Schematic diagram rendered above]'
  )

  return (
    <div className="w-full space-y-3">
      {/* Schematic viewer — always on top if hierarchy data exists */}
      {hasHierarchy && (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${accent}25`, background: 'rgba(0,0,0,0.5)', minHeight: 300 }}
        >
          <SchematicViewer output={content} accent={accent} />
        </div>
      )}
      {/* All text sections below */}
      <OutputRenderer output={contentForRenderer} accentColor={accent} />
    </div>
  )
}

export default function SchematicPanel({ tool, apiKey, onNewHistoryEntry, externalInput, externalTrigger }) {
  const accent = tool?.accent || '#00e676'
  const [mode, setMode] = useState('nl')

  const [nlInput, setNlInput]       = useState('')
  const [nlHistory, setNlHistory]   = useState([])
  const [nlLoading, setNlLoading]   = useState(false)

  const [hdlCode, setHdlCode]       = useState('')
  const [hdlHistory, setHdlHistory] = useState([])
  const [hdlLoading, setHdlLoading] = useState(false)

  const [copied, setCopied] = useState(false)

  // Scroll refs — one per mode
  const nlScrollRef  = useRef(null)
  const hdlScrollRef = useRef(null)
  // Ref to the last AI message for scroll-to-top-of-response
  const lastMsgRef   = useRef(null)

  // Wire external input from Examples/History panels
  useEffect(() => {
    if (!externalInput || externalTrigger === 0) return
    if (mode === 'hdl') setHdlCode(externalInput)
    else setNlInput(externalInput)
  }, [externalTrigger])

  // Scroll so the START of the latest AI response is visible
  const scrollToLatestResponse = useCallback((scrollRef) => {
    requestAnimationFrame(() => {
      if (lastMsgRef.current && scrollRef.current) {
        const container = scrollRef.current
        const msgTop = lastMsgRef.current.offsetTop
        // Scroll container so new message starts near the top with 16px padding
        container.scrollTo({ top: Math.max(0, msgTop - 16), behavior: 'smooth' })
      }
    })
  }, [])

  const sendNl = async () => {
    if (!nlInput.trim() || nlLoading) return
    if (!apiKey || apiKey.length < 8) {
      setNlHistory(h => [...h, { role: 'error', content: 'Enter a valid API key in the sidebar.' }])
      return
    }
    const msg = nlInput.trim()
    setNlInput('')
    setNlHistory(h => [...h, { role: 'user', content: msg }])
    setNlLoading(true)
    try {
      const result = await callClaude(apiKey, SYS_NL, msg)
      setNlHistory(h => {
        const updated = [...h, { role: 'assistant', content: result }]
        return updated
      })
      if (onNewHistoryEntry) onNewHistoryEntry({ prompt: msg, response: result, timestamp: Date.now() })
      // Scroll to top of new message after render
      setTimeout(() => scrollToLatestResponse(nlScrollRef), 100)
    } catch (e) {
      setNlHistory(h => [...h, { role: 'error', content: `Error: ${e.message}` }])
    }
    setNlLoading(false)
  }

  const sendHdl = async () => {
    if (!hdlCode.trim() || hdlLoading) return
    if (!apiKey || apiKey.length < 8) {
      setHdlHistory(h => [...h, { role: 'error', content: 'Enter a valid API key in the sidebar.' }])
      return
    }
    const lang = detectHdlLang(hdlCode)
    const userMsg = `Analyze this ${lang.toUpperCase()} code and generate full schematic + elaboration report:\n\n\`\`\`${lang}\n${hdlCode.trim()}\n\`\`\``
    setHdlHistory(h => [...h, { role: 'user', content: userMsg }])
    setHdlLoading(true)
    try {
      const result = await callClaude(apiKey, SYS_HDL, userMsg)
      setHdlHistory(h => [...h, { role: 'assistant', content: result }])
      if (onNewHistoryEntry) onNewHistoryEntry({ prompt: userMsg, response: result, timestamp: Date.now() })
      setTimeout(() => scrollToLatestResponse(hdlScrollRef), 100)
    } catch (e) {
      setHdlHistory(h => [...h, { role: 'error', content: `Error: ${e.message}` }])
    }
    setHdlLoading(false)
  }

  const handleKey = (e, fn) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) fn() }

  const currentHistory = mode === 'nl' ? nlHistory : hdlHistory
  const lastAssistant  = [...currentHistory].reverse().find(h => h.role === 'assistant')
  const copyLast = () => {
    if (lastAssistant) { navigator.clipboard.writeText(lastAssistant.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  }
  const clearChat = () => { if (mode === 'nl') setNlHistory([]); else setHdlHistory([]) }

  const loading = mode === 'nl' ? nlLoading : hdlLoading

  // Render a single message bubble
  const renderMessage = (msg, i, isLast) => (
    <div
      key={i}
      ref={isLast && msg.role === 'assistant' ? lastMsgRef : null}
      className={`flex gap-3 slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
    >
      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[9px]"
        style={{
          background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : `${accent}15`,
          border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${accent}35`,
          color: msg.role === 'user' ? '#6b8499' : accent,
        }}>
        {msg.role === 'user' ? 'U' : msg.role === 'error' ? '!' : 'AI'}
      </div>

      <div className={`max-w-[92%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start w-full'}`}>
        {msg.role === 'user' ? (
          <div className="px-4 py-3 rounded-xl rounded-tr-sm"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="font-mono text-xs text-scope-text whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ) : msg.role === 'error' ? (
          <div className="px-4 py-3 rounded-xl rounded-tl-sm"
            style={{ background: 'rgba(255,69,96,0.06)', border: '1px solid rgba(255,69,96,0.25)' }}>
            <p className="font-mono text-xs text-scope-red whitespace-pre-wrap">{msg.content}</p>
          </div>
        ) : (
          <AssistantMessage content={msg.content} accent={accent} />
        )}
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'rgba(4,7,10,0.55)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-2.5 flex-shrink-0 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent}10 0%, transparent 60%), rgba(8,13,20,0.6)`,
          borderBottom: `1px solid ${accent}20`,
        }}>
        <div className="chip-corner chip-corner-tl" style={{ borderColor: `${accent}30` }} />
        <div className="chip-corner chip-corner-br" style={{ borderColor: `${accent}30` }} />
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}15`, border: `1px solid ${accent}35`, boxShadow: `0 0 12px ${accent}20` }}>
          <Cpu size={15} style={{ color: accent }} />
        </div>
        <div>
          <h2 className="font-mono text-[12px] font-bold tracking-wide" style={{ color: accent }}>SCHEMATIC GENERATOR</h2>
          <p className="font-mono text-[9px] text-scope-dim mt-0.5">
            RTL Elaboration · Gate-Level Synthesis · Block Diagram View · Xilinx-style Output
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: accent }} />
          <span className="font-mono text-[9px]" style={{ color: accent }}>READY</span>
        </div>
      </div>

      {/* Tips banner */}
      <div className="flex items-start gap-2 px-4 py-2 font-mono text-[9px] flex-shrink-0"
        style={{ background: `${accent}06`, borderBottom: `1px solid ${accent}12` }}>
        <Lightbulb size={10} style={{ color: accent, marginTop: 1, flexShrink: 0 }} />
        <span style={{ color: '#78909c' }}>
          Describe any digital/analog circuit or paste HDL code. Generates an interactive block diagram, structural netlist, resource utilisation, and timing analysis — like Xilinx Vivado synthesis.
        </span>
      </div>

      {/* Mode tabs + toolbar */}
      <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)`, background: 'rgba(4,7,10,0.4)' }}>
        <ModeTab label="NL → Schematic"  active={mode === 'nl'}  onClick={() => setMode('nl')}  icon={Lightbulb} />
        <ModeTab label="HDL → Schematic" active={mode === 'hdl'} onClick={() => setMode('hdl')} icon={FileCode}  />
        <div className="ml-auto flex items-center px-3 gap-1.5">
          <button onClick={copyLast} title="Copy last response"
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: copied ? accent : '#546e7a' }}>
            {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
          </button>
          <button onClick={clearChat} title="Clear chat"
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#546e7a' }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* ── NL MODE ── */}
      {mode === 'nl' && (
        <>
          <div ref={nlScrollRef} className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollBehavior: 'smooth' }}>
            {nlHistory.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-48">
                <div className="text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center scan-line"
                    style={{ background: `${accent}08`, border: `1px solid ${accent}25` }}>
                    <Cpu size={26} style={{ color: accent, opacity: 0.6 }} />
                  </div>
                  <p className="font-mono text-sm font-semibold text-scope-dim">Describe your circuit</p>
                  <p className="font-mono text-[10px] text-scope-muted leading-relaxed">
                    Get a full Xilinx-style block diagram with structural netlist,
                    resource utilisation, and timing analysis.
                  </p>
                  <div className="text-left rounded p-3 font-mono text-[9px] text-scope-muted space-y-1"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div><span style={{ color: accent }}>→</span> "8-bit synchronous counter with reset"</div>
                    <div><span style={{ color: accent }}>→</span> "4-bit ALU with carry-lookahead"</div>
                    <div><span style={{ color: accent }}>→</span> "AXI4-Lite slave register file, 8 regs"</div>
                  </div>
                </div>
              </div>
            )}
            {nlHistory.map((msg, i) => renderMessage(msg, i, i === nlHistory.length - 1))}
            {nlLoading && (
              <div className="flex gap-3 slide-up">
                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}35` }}>
                  <Loader2 size={11} className="animate-spin" style={{ color: accent }} />
                </div>
                <div className="px-4 py-3 rounded-xl flex items-center gap-2"
                  style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: accent, animation: `pulse-dot 1.4s ease-in-out ${i * 0.25}s infinite` }} />
                  ))}
                  <span className="font-mono text-[10px] ml-1" style={{ color: accent }}>Synthesizing schematic…</span>
                </div>
              </div>
            )}
          </div>
          {/* NL Input */}
          <div className="flex-shrink-0 p-4"
            style={{ background: 'rgba(8,13,20,0.85)', borderTop: '1px solid rgba(20,32,48,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={nlInput}
                  onChange={e => setNlInput(e.target.value)}
                  onKeyDown={e => handleKey(e, sendNl)}
                  placeholder={`Describe your circuit…\nE.g. "4-bit synchronous up-counter with synchronous reset and enable"`}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 font-mono text-xs text-scope-text placeholder-scope-muted resize-none leading-relaxed"
                  style={{ background: 'rgba(4,7,10,0.8)', border: `1px solid ${accent}18`, outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = `${accent}40`; e.target.style.boxShadow = `0 0 0 2px ${accent}10` }}
                  onBlur={e  => { e.target.style.borderColor = `${accent}18`; e.target.style.boxShadow = 'none' }}
                />
                <span className="absolute bottom-2.5 right-3 font-mono text-[9px] text-scope-muted pointer-events-none">⌃↵ send</span>
              </div>
              <button onClick={sendNl} disabled={nlLoading || !nlInput.trim()}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: (!nlInput.trim() || nlLoading) ? 'rgba(255,255,255,0.04)' : `${accent}18`,
                  border: `1px solid ${(!nlInput.trim() || nlLoading) ? 'rgba(255,255,255,0.06)' : accent + '40'}`,
                  color: (!nlInput.trim() || nlLoading) ? '#3a4552' : accent,
                  boxShadow: (!nlInput.trim() || nlLoading) ? 'none' : `0 0 12px ${accent}25`,
                }}>
                {nlLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── HDL MODE ── */}
      {mode === 'hdl' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code editor */}
          <div className="flex-shrink-0 flex flex-col" style={{ borderBottom: `1px solid ${accent}18` }}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ background: `${accent}08` }}>
              <span className="font-mono text-[9px] font-bold tracking-widest" style={{ color: accent }}>
                HDL EDITOR — {hdlCode ? detectHdlLang(hdlCode).toUpperCase() : 'PASTE CODE'}
              </span>
              <div className="flex items-center gap-2">
                {hdlCode && (
                  <button onClick={() => setHdlCode('')}
                    className="font-mono text-[9px] text-scope-muted hover:text-scope-red transition-colors">
                    clear
                  </button>
                )}
                <span className="font-mono text-[9px] text-scope-muted">⌃↵ analyze</span>
              </div>
            </div>
            <textarea
              value={hdlCode}
              onChange={e => setHdlCode(e.target.value)}
              onKeyDown={e => handleKey(e, sendHdl)}
              placeholder={HDL_PLACEHOLDER}
              rows={10}
              spellCheck={false}
              className="w-full font-mono text-[11px] leading-relaxed resize-none outline-none p-4"
              style={{
                background: 'rgba(2,4,6,0.8)', color: '#b0bec5', border: 'none',
                tabSize: 2, minHeight: 180, maxHeight: 240,
              }}
            />
            <div className="flex items-center justify-between px-3 py-2"
              style={{ borderTop: `1px solid ${accent}12`, background: 'rgba(4,7,10,0.5)' }}>
              <span className="font-mono text-[9px] text-scope-muted">
                {hdlCode ? `${hdlCode.split('\n').length} lines · ${hdlCode.length} chars` : 'Verilog · SystemVerilog · VHDL supported'}
              </span>
              <button onClick={sendHdl} disabled={hdlLoading || !hdlCode.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition-all"
                style={{
                  background: (!hdlCode.trim() || hdlLoading) ? 'rgba(255,255,255,0.04)' : `${accent}18`,
                  border: `1px solid ${(!hdlCode.trim() || hdlLoading) ? 'rgba(255,255,255,0.06)' : accent + '40'}`,
                  color: (!hdlCode.trim() || hdlLoading) ? '#3a4552' : accent,
                  boxShadow: (!hdlCode.trim() || hdlLoading) ? 'none' : `0 0 10px ${accent}20`,
                }}>
                {hdlLoading ? <Loader2 size={11} className="animate-spin" /> : <Code2 size={11} />}
                {hdlLoading ? 'Elaborating…' : 'Run Elaboration'}
              </button>
            </div>
          </div>

          {/* HDL output area */}
          <div ref={hdlScrollRef} className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollBehavior: 'smooth' }}>
            {hdlHistory.length === 0 && (
              <div className="text-center py-10 space-y-3">
                <FileCode size={28} className="mx-auto opacity-20" style={{ color: accent }} />
                <p className="font-mono text-[10px] text-scope-muted">
                  Paste HDL code above and click <span style={{ color: accent }}>Run Elaboration</span>
                </p>
                <p className="font-mono text-[9px] text-scope-muted opacity-60">
                  Generates schematic block diagram · resource utilisation · timing summary
                </p>
              </div>
            )}
            {hdlHistory.map((msg, i) => renderMessage(msg, i, i === hdlHistory.length - 1))}
            {hdlLoading && (
              <div className="flex gap-3 slide-up">
                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}35` }}>
                  <Loader2 size={11} className="animate-spin" style={{ color: accent }} />
                </div>
                <div className="px-4 py-3 rounded-xl flex items-center gap-2"
                  style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: accent, animation: `pulse-dot 1.4s ease-in-out ${i * 0.25}s infinite` }} />
                  ))}
                  <span className="font-mono text-[10px] ml-1" style={{ color: accent }}>Elaborating HDL → schematic…</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

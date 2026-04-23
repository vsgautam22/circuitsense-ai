import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import SchematicPanel from './components/SchematicPanel.jsx'
import ExamplesPanel from './components/ExamplesPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import CircuitBackground from './components/CircuitBackground.jsx'

import { meta as schematicMeta, systemPrompt as schematicSP, hdlSystemPrompt as schematicHDL } from './tools/schematicGen.js'
import { meta as protocolMeta,  systemPrompt as protocolSP  } from './tools/protocolAnalyzer.js'
import { meta as rtlMeta,       systemPrompt as rtlSP       } from './tools/rtlAssistant.js'
import { meta as timingMeta,    systemPrompt as timingSP    } from './tools/timingAdvisor.js'
import { meta as faultMeta,     systemPrompt as faultSP     } from './tools/faultClassifier.js'
import { meta as componentMeta, systemPrompt as componentSP } from './tools/componentSelector.js'

const TOOLS = [
  { ...schematicMeta, systemPrompt: schematicSP, hdlSystemPrompt: schematicHDL },
  { ...protocolMeta,  systemPrompt: protocolSP  },
  { ...rtlMeta,       systemPrompt: rtlSP       },
  { ...timingMeta,    systemPrompt: timingSP     },
  { ...faultMeta,     systemPrompt: faultSP      },
  { ...componentMeta, systemPrompt: componentSP  },
]

export default function App() {
  const [activeTool, setActiveTool]             = useState(TOOLS[0])
  const [apiKey, setApiKey]                     = useState(() => localStorage.getItem('cs_apikey') || '')
  const [inputText, setInputText]               = useState('')
  const [newHistoryEntry, setNewHistoryEntry]   = useState(null)
  const [exampleTrigger, setExampleTrigger]     = useState(0)
  const [rightPanelOpen, setRightPanelOpen]     = useState(true)

  const handleApiKey = key => {
    setApiKey(key)
    localStorage.setItem('cs_apikey', key)
  }

  const handleExternalInput = (text) => {
    setInputText(text)
    setExampleTrigger(t => t + 1)
  }

  const isSchematic = activeTool?.id === 'schematic'

  return (
    <div className="relative flex h-screen overflow-hidden">
      <CircuitBackground />
      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          tools={TOOLS}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          apiKey={apiKey}
          onApiKeyChange={handleApiKey}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar activeTool={activeTool} apiKey={apiKey} />
          <div className="flex-1 flex overflow-hidden">

            {isSchematic ? (
              <SchematicPanel
                tool={activeTool}
                apiKey={apiKey}
                onNewHistoryEntry={setNewHistoryEntry}
                externalInput={inputText}
                externalTrigger={exampleTrigger}
              />
            ) : (
              <ChatPanel
                tool={activeTool}
                apiKey={apiKey}
                inputText={inputText}
                onInputChange={setInputText}
                onNewHistoryEntry={setNewHistoryEntry}
              />
            )}

            {/* Right panel with smooth collapse */}
            <div
              className="flex flex-col flex-shrink-0 overflow-hidden"
              style={{
                width: rightPanelOpen ? 280 : 0,
                minWidth: rightPanelOpen ? 280 : 0,
                borderLeft: rightPanelOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: 'rgba(6,10,14,0.88)',
                backdropFilter: 'blur(12px)',
                transition: 'width 0.25s ease, min-width 0.25s ease',
                overflow: 'hidden',
              }}
            >
              <div className="flex flex-col overflow-hidden" style={{ height: '50%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <HistoryPanel
                  tool={activeTool}
                  onReuse={handleExternalInput}
                  newEntry={newHistoryEntry}
                  onTogglePanel={() => setRightPanelOpen(v => !v)}
                  panelOpen={rightPanelOpen}
                />
              </div>
              <div className="flex flex-col overflow-hidden" style={{ height: '50%' }}>
                <ExamplesPanel
                  tool={activeTool}
                  onSelect={handleExternalInput}
                />
              </div>
            </div>

            {/* Floating re-open tab when panel is collapsed */}
            {!rightPanelOpen && (
              <button
                onClick={() => setRightPanelOpen(true)}
                className="flex-shrink-0 flex items-center justify-center w-6 border-l transition-all"
                style={{
                  background: 'rgba(6,10,14,0.88)',
                  borderColor: 'rgba(255,255,255,0.05)',
                  color: activeTool?.accent || '#00ff88',
                }}
                title="Show history & examples"
              >
                <svg width="10" height="40" viewBox="0 0 10 40">
                  <text x="5" y="28" textAnchor="middle" fontSize="9" fill="currentColor"
                    fontFamily="JetBrains Mono" style={{ writingMode: 'vertical-rl' }}>
                    PANEL
                  </text>
                </svg>
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

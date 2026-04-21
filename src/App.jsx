import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import SchematicPanel from './components/SchematicPanel.jsx'
import ExamplesPanel from './components/ExamplesPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import CircuitBackground from './components/CircuitBackground.jsx'

import { meta as schematicMeta, systemPrompt as schematicSP } from './tools/schematicGen.js'
import { meta as protocolMeta,  systemPrompt as protocolSP  } from './tools/protocolAnalyzer.js'
import { meta as rtlMeta,       systemPrompt as rtlSP       } from './tools/rtlAssistant.js'
import { meta as timingMeta,    systemPrompt as timingSP    } from './tools/timingAdvisor.js'
import { meta as faultMeta,     systemPrompt as faultSP     } from './tools/faultClassifier.js'
import { meta as componentMeta, systemPrompt as componentSP } from './tools/componentSelector.js'

const TOOLS = [
  { ...schematicMeta, systemPrompt: schematicSP },
  { ...protocolMeta,  systemPrompt: protocolSP  },
  { ...rtlMeta,       systemPrompt: rtlSP       },
  { ...timingMeta,    systemPrompt: timingSP     },
  { ...faultMeta,     systemPrompt: faultSP      },
  { ...componentMeta, systemPrompt: componentSP  },
]

export default function App() {
  const [activeTool, setActiveTool]       = useState(TOOLS[0])
  const [apiKey, setApiKey]               = useState(() => localStorage.getItem('cs_apikey') || '')
  const [inputText, setInputText]         = useState('')
  const [newHistoryEntry, setNewHistoryEntry] = useState(null)

  const handleApiKey = key => {
    setApiKey(key)
    localStorage.setItem('cs_apikey', key)
  }

  const isSchematic = activeTool?.id === 'schematic'

  return (
    <div className="relative flex h-screen overflow-hidden">
      <CircuitBackground />

      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar */}
        <Sidebar
          tools={TOOLS}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          apiKey={apiKey}
          onApiKeyChange={handleApiKey}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar activeTool={activeTool} apiKey={apiKey} />

          <div className="flex-1 flex overflow-hidden">
            {/* Primary panel — SchematicPanel for schematic tool, ChatPanel for all others */}
            {isSchematic ? (
              <SchematicPanel
                tool={activeTool}
                apiKey={apiKey}
                onNewHistoryEntry={setNewHistoryEntry}
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

            {/* Right panel: History (top half) + Examples (bottom half) */}
            <div
              className="flex flex-col flex-shrink-0"
              style={{
                width: 280,
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(6,10,14,0.88)',
                backdropFilter: 'blur(12px)',
                overflow: 'hidden',
              }}
            >
              {/* History — top half */}
              <div
                className="flex flex-col"
                style={{
                  flex: '1 1 50%',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <HistoryPanel
                  tool={activeTool}
                  onReuse={(prompt) => setInputText(prompt)}
                  newEntry={newHistoryEntry}
                />
              </div>

              {/* Examples — bottom half */}
              <div
                className="flex flex-col"
                style={{
                  flex: '1 1 50%',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <ExamplesPanel
                  tool={activeTool}
                  onSelect={(text) => setInputText(text)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

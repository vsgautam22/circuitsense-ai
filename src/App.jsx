import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import ExamplesPanel from './components/ExamplesPanel.jsx'
import CircuitBackground from './components/CircuitBackground.jsx'
import { detectProvider, providerLabel, providerColor } from './lib/claudeClient.js'

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
  const [activeTool, setActiveTool] = useState(TOOLS[0])
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cs_apikey') || '')
  const [inputText, setInputText] = useState('')

  const handleApiKey = key => {
    setApiKey(key)
    localStorage.setItem('cs_apikey', key)
  }

  const handleSelectExample = (text) => {
    setInputText(text)
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Animated circuit board background */}
      <CircuitBackground />

      {/* App shell — sits above background */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          tools={TOOLS}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          apiKey={apiKey}
          onApiKeyChange={handleApiKey}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar activeTool={activeTool} apiKey={apiKey} />
          <div className="flex-1 flex overflow-hidden">
            <ChatPanel 
              tool={activeTool} 
              apiKey={apiKey} 
              inputText={inputText}
              onInputChange={setInputText}
            />
            <ExamplesPanel 
              tool={activeTool} 
              onSelect={handleSelectExample} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

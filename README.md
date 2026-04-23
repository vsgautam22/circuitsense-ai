# ◈ CircuitSense AI

> **AI-powered VLSI Intelligence Platform** — RTL elaboration, schematic generation, protocol analysis, fault classification, and timing constraint synthesis. Built for electronics engineers and VLSI students.

🌐 **Live Demo → [circuitsense-ai.vercel.app](https://circuitsense-ai.vercel.app)**

![CircuitSense AI Screenshot](public/screenshots/main.png)

---

## ✦ Features

| Module | Description |
|--------|-------------|
| **Schematic Generator** | Natural language → SVG block diagram + structural netlist (Xilinx Vivado-style). HDL code → gate-level elaboration with resource utilisation and timing summary |
| **Protocol Analyzer** | SPI · I2C · AXI4-Lite · UART timing analysis with ASCII waveform diagrams and violation detection |
| **RTL Code Assistant** | Generate production-quality Verilog / SystemVerilog / VHDL with testbench skeletons and synthesis notes |
| **Timing Constraint Advisor** | Full SDC constraint generation, setup/hold analysis, multicycle path and false path identification |
| **Fault Model Classifier** | Stuck-at · Bridging · Transition fault diagnosis with ATPG guidance and distinguishing test vectors |
| **Component Selector** | IC part recommendations with BOM, application circuits, and tradeoff comparison tables |

---

## ✦ Tech Stack

- **Frontend** — React 18 + Vite 5 + TailwindCSS
- **AI Providers** — Multi-provider: Google Gemini (free), Groq (free), Anthropic Claude, OpenAI, OpenRouter
- **Rendering** — Custom SVG schematic engine with topological auto-layout
- **State** — React hooks + localStorage persistence (history, examples, API key)
- **Deployment** — Vercel

---

## ✦ Running Locally

```bash
git clone https://github.com/vsgautam22/circuitsense-ai.git
cd circuitsense-ai
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**No backend required.** The app calls AI provider APIs directly from the browser using your own API key.

---

## ✦ Getting a Free API Key

| Provider | Model | Link |
|----------|-------|------|
| **Groq** (recommended) | llama-3.3-70b-versatile | [console.groq.com/keys](https://console.groq.com/keys) |
| **Google Gemini** | gemini-2.0-flash | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Anthropic | claude-3-5-haiku | [console.anthropic.com](https://console.anthropic.com) |
| OpenRouter | meta-llama (free tier) | [openrouter.ai/keys](https://openrouter.ai/keys) |

Enter your key in the sidebar → Save. Keys are stored only in your browser's localStorage.

---

## ✦ Architecture
src/
├── components/
│   ├── SchematicPanel.jsx    # Dual-mode schematic generator (NL + HDL)
│   ├── SchematicViewer.jsx   # SVG block diagram renderer with auto-layout
│   ├── ChatPanel.jsx         # Chat interface for all other tools
│   ├── OutputRenderer.jsx    # Structured output parser (sections, code, tables)
│   ├── HistoryPanel.jsx      # Per-tool query history (localStorage)
│   ├── ExamplesPanel.jsx     # Editable example prompts per tool
│   ├── Sidebar.jsx           # Navigation with VLSI SVG icons
│   └── TopBar.jsx            # Status bar with waveform decoration
├── tools/
│   ├── schematicGen.js       # System prompts for schematic generation
│   ├── protocolAnalyzer.js   # System prompts for protocol analysis
│   ├── rtlAssistant.js       # System prompts for RTL code generation
│   ├── timingAdvisor.js      # System prompts for SDC constraints
│   ├── faultClassifier.js    # System prompts for fault diagnosis
│   └── componentSelector.js  # System prompts for component selection
└── lib/
└── claudeClient.js       # Multi-provider AI client (Gemini/Groq/Anthropic/OpenAI/OpenRouter)

---

## ✦ Key Design Decisions

**Multi-provider AI client** — A single `callClaude()` function auto-detects provider from API key prefix (`AIza` → Gemini, `gsk_` → Groq, `sk-ant-` → Anthropic) and routes to the correct endpoint. This means users can switch providers without changing any code.

**JSON-driven schematic rendering** — The AI returns structured JSON describing circuit hierarchy (modules, ports, nets). A custom topological layout engine assigns columns/rows to modules and routes bezier-curve wires between port anchors. No external EDA library required.

**VLSI-authentic aesthetic** — Inspired by Cadence Virtuoso and Xilinx Vivado. JetBrains Mono throughout, oscilloscope-green (#00ff88) as primary accent, animated circuit board background with signal particles.

---

## ✦ Screenshots

| Schematic Generator (NL Mode) | Protocol Analyzer |
|-------------------------------|-------------------|
| ![Schematic](public/screenshots/schematic.png) | ![Protocol](public/screenshots/protocol.png) |

---

## ✦ About

Built by **Gautam Suresh** — Pre-final year B.E. Electronics Engineering (VLSI Design & Technology), Chennai Institute of Technology.

Part of a competitive FPGA/VLSI portfolio built for placement drives. Other projects:

- [`crc-engine`](https://github.com/vsgautam22/crc-engine) — CRC-32 ASIC, taped out on SKY130A, 0 DRC violations
- [`riscv-core`](https://github.com/vsgautam22/riscv-core) — RV32I 5-stage pipeline, 14/14 tests passing
- [`ooo-pipeline-engine`](https://github.com/vsgautam22/ooo-pipeline-engine) — Kronos-32 Out-of-Order Engine (Tomasulo's algorithm)

---

## ✦ License

MIT © 2025 Gautam Suresh

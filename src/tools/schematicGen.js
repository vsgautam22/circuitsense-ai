export const meta = {
  id: 'schematic',
  label: 'Schematic Generator',
  icon: 'Cpu',
  color: 'text-scope-green',
  accent: '#00e676',
  placeholder: 'Describe the circuit you want to build...\n\nExample: "A low-pass RC filter with cutoff at 1kHz followed by an op-amp unity gain buffer"',
  examples: [
    'Design a 2nd-order Sallen-Key low-pass filter with fc = 1kHz, Butterworth response, powered by ±12V',
    '555 timer astable multivibrator circuit generating a 50% duty cycle square wave at 1kHz',
    'CMOS inverter with fanout-4 sizing using NMOS W/L=2 and PMOS W/L=4 on 180nm process',
    'Differential amplifier with 100Ω emitter degeneration resistors, Vcc=15V, Ic=1mA, gain=20dB',
    '3.3V to 1.8V synchronous buck converter at 500mA, 500kHz switching, 22µH inductor',
  ],
}

export const systemPrompt = `You are a VLSI and analog/digital circuit design expert.
Given a natural language description, produce:
1. COMPONENT LIST — table of components with values, tolerances, and part number suggestions
2. NETLIST — a text-based netlist in SPICE-like format showing node connections
3. DESIGN NOTES — key design considerations, tradeoffs, and warnings
4. VERILOG STUB (if digital) — a behavioral Verilog module skeleton

Format your response with clear section headers using ===SECTION NAME===
Use monospace-friendly ASCII for any diagrams.
Be precise with values, include units always.`

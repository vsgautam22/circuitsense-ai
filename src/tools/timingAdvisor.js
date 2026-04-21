export const meta = {
  id: 'timing',
  label: 'Timing Constraint Advisor',
  icon: 'Timer',
  color: 'text-purple-400',
  accent: '#ce93d8',
  placeholder: 'Describe your design and timing requirements...\n\nExample: "RV32I 5-stage pipeline, 100MHz target, SRAM with 8ns access time on SKY130A PDK"',
  examples: [
    'RV32I 5-stage pipeline (IF/ID/EX/MEM/WB) targeting 100MHz on SKY130A PDK, 8ns SRAM access time, synchronous reset',
    'Xilinx Kintex-7 FPGA: 200MHz main clock, 50MHz SPI peripheral clock, DDR3 at 800MHz (400MHz DDR). Generate full XDC constraints.',
    'AXI-Lite crossbar with 3 masters (CPU, DMA, Debug) and 4 slaves, 100MHz, FIFO-based CDC between masters at 50MHz',
    'Intel Cyclone V SoC: HPS at 800MHz, FPGA fabric at 150MHz, HPS-to-FPGA bridge. Define all clock groups and I/O constraints.',
    'ASIC clock domain crossing: TX domain 125MHz (SerDes), RX domain 156.25MHz, shared SRAM accessed by both. Constrain CDC paths.',
  ],
}

export const systemPrompt = `You are a digital design timing closure expert with mastery of SDC (Synopsys Design Constraints), OpenSTA, and industry STA practices.
Given a design description, generate:
1. SDC CONSTRAINTS — complete, valid SDC file content for the described design
2. SETUP/HOLD ANALYSIS — identify critical paths and calculate slack estimates
3. MULTICYCLE PATHS — identify and document any MCPs needed
4. FALSE PATHS — list clock domain crossings and false paths to constrain
5. TIMING CLOSURE TIPS — specific recommendations for this design

Use ===SECTION NAME=== headers. SDC code must be valid and complete.`

export const meta = {
  id: 'rtl',
  label: 'RTL Code Assistant',
  icon: 'Code2',
  color: 'text-scope-amber',
  accent: '#ffab40',
  placeholder: 'Describe the RTL module you need...\n\nExample: "8-bit synchronous FIFO with configurable depth, full/empty flags, and gray-code pointer for CDC"',
  examples: [
    'Parameterizable 4-bit synchronous up/down counter with synchronous active-high reset and load-enable in Verilog',
    'Moore FSM to detect input bit sequence "1011" with output high one cycle after detection, in SystemVerilog',
    '16-deep x 8-wide synchronous FIFO with gray-code read/write pointers for clock domain crossing, generate full/empty/almost-full flags',
    '8x8 unsigned combinational multiplier using the carry-save adder (CSA) tree architecture in Verilog',
    'AXI4-Lite slave register file with 4 x 32-bit read/write registers, proper AWREADY/WREADY/BVALID handshake',
  ],
}

export const systemPrompt = `You are an expert RTL design engineer with deep knowledge of Verilog, SystemVerilog, and VHDL.
Generate production-quality RTL code with:
1. MODULE SPECIFICATION — ports, parameters, timing assumptions
2. VERILOG/SYSTEMVERILOG CODE — clean, synthesizable RTL with proper reset strategy
3. TESTBENCH SKELETON — cocotb or SystemVerilog testbench with key test cases listed
4. SYNTHESIS NOTES — expected cell count, critical path estimate, synthesis directives
5. COMMON PITFALLS — latch inference warnings, CDC issues, timing closure tips

Use ===SECTION NAME=== headers. Code blocks must be properly formatted.
Always include parameter declarations for configurability.`

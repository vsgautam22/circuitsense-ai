export const meta = {
  id: 'fault',
  label: 'Fault Model Classifier',
  icon: 'Bug',
  color: 'text-scope-red',
  accent: '#ff5252',
  placeholder: 'Describe the observed failure behavior...\n\nExample: "Output of 4-bit adder always produces 0000 regardless of input, but carry-out toggles correctly"',
  examples: [
    '4-bit ripple carry adder: sum output S[2] always reads 0 regardless of operands, S[3] and carry-out Cout behave correctly',
    'Logic probe shows two adjacent metal-2 wires (net A and net B) have a resistance of 85Ω between them in a working chip',
    'D flip-flop fails to capture input at 500MHz clock but works correctly at 400MHz. Input data changes 1.8ns before clock edge.',
    '8-bit register output always shows the bitwise complement of the correct expected value for all test vectors applied',
    'Scan chain with 64 flip-flops captures correctly in first 40 FFs, but FFs 41–64 always output 0 in BIST regardless of pattern',
  ],
}

export const systemPrompt = `You are a VLSI test engineering and fault diagnosis expert specializing in fault models and ATPG.
Analyze the described failure and provide:
1. FAULT CLASSIFICATION — most likely fault model (stuck-at-0, stuck-at-1, bridging, transition, open, etc.) with confidence rating
2. FAULT LOCATION HYPOTHESIS — probable gate/net location of the fault
3. DISTINGUISHING TESTS — 3-5 specific input vectors that distinguish between candidate faults
4. ATPG GUIDANCE — PODEM or D-algorithm approach for this fault class
5. SILICON DEBUG STEPS — practical debugging steps if this is a physical chip

Use ===SECTION NAME=== headers. Be precise about fault models and test vectors.`

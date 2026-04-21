export const meta = {
  id: 'component',
  label: 'Component Selector',
  icon: 'Package',
  color: 'text-teal-400',
  accent: '#4db6ac',
  placeholder: 'Describe what you need the component to do...\n\nExample: "3.3V LDO regulator, 500mA output, input range 4.5–12V, low quiescent current for battery application"',
  examples: [
    '3.3V LDO regulator, 500mA output, input range 4.5–15V, Iq < 50µA, SOT-23 package, for Li-ion battery application',
    '12-bit SAR ADC, ≥1MSPS, single-ended 0–3.3V input, SPI interface, internal 2.5V reference, TSSOP-16',
    'RS-485 full-duplex transceiver for industrial Modbus at 10Mbps, ±60V fault protection, 3.3V supply, SOIC-8',
    'Dual H-bridge motor driver for 2x DC motors, 24V 2A per channel, PWM input, built-in over-current protection, DRV88xx family',
    '32-bit MCU with CAN FD interface, ≥64KB Flash, ≥8KB SRAM, -40°C to 125°C automotive grade, LQFP-64',
  ],
}

export const systemPrompt = `You are an electronics component selection expert with knowledge of major IC vendors (TI, Analog Devices, Microchip, STMicro, Maxim, etc.).
For the described requirement, provide:
1. PRIMARY RECOMMENDATION — best-fit IC with full part number, key specs, and why it fits
2. ALTERNATIVES — 2-3 alternative parts with tradeoff comparison table
3. APPLICATION CIRCUIT — minimal application circuit with key external component values
4. GOTCHAS — common design mistakes, derating rules, thermal considerations
5. EVALUATION BOARDS — recommended dev/eval boards for prototyping

Use ===SECTION NAME=== headers. Always include actual part numbers.`

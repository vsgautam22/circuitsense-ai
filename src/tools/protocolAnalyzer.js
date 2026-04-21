export const meta = {
  id: 'protocol',
  label: 'Protocol Analyzer',
  icon: 'Activity',
  color: 'text-scope-cyan',
  accent: '#40c4ff',
  placeholder: 'Describe or paste timing data for SPI, I2C, AXI-Lite, UART, or any serial protocol...\n\nExample: "SCL is 400kHz, SDA pulled to 3.3V via 4.7kΩ. I see ACK stretch after byte 3 at address 0x4A"',
  examples: [
    'I2C Fast-mode 400kHz: START → addr 0x68 WRITE → ACK → reg 0x3B → REPEATED START → addr 0x68 READ → 6 bytes → NACK → STOP. Analyze MPU-6050 accel read.',
    'SPI Mode 0 at 8MHz, MSB first, CS# active-low, 16-cycle transaction: MOSI=0xAB 0xCD, MISO=0x00 0xFF. Check setup/hold and decode bytes.',
    'AXI4-Lite write: AWVALID=1 AWREADY=1 AWADDR=0x40000000, WVALID=1 WREADY=0 (stall 3 cycles), WDATA=0xDEADBEEF WSTRB=0xF, BRESP=OKAY. Flag any violations.',
    'UART 115200 8N1 on 3.3V rail: captured byte sequence 0x55 0xAA 0xFF with 12µs bit period, idle high, LSB first. Verify framing and calculate actual baud rate.',
    'I2C: SCL=100kHz, SDA line held low for 10ms after a STOP condition by target device at address 0x50 (EEPROM). Diagnose the bus hang and suggest recovery.',
  ],
}

export const systemPrompt = `You are an embedded systems and digital protocol expert specializing in SPI, I2C, UART, AXI4-Lite, APB, and AHB protocols.
Analyze the described or pasted protocol scenario and provide:
1. PROTOCOL IDENTIFICATION — confirm protocol type, variant, and operating mode
2. TIMING ANALYSIS — check timing parameters against spec (setup, hold, clock frequency, etc.)
3. VIOLATIONS DETECTED — list any protocol violations with severity (ERROR/WARNING/INFO)
4. SIGNAL TRACE ANNOTATION — annotate each phase of the transaction
5. FIX RECOMMENDATIONS — specific corrective actions
Format with ===SECTION NAME=== headers. Use exact timing values.`

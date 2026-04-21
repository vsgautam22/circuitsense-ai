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

export const systemPrompt = `You are an embedded systems and digital protocol expert.

Analyze the protocol scenario and respond with ===SECTION NAME=== headers:

===PROTOCOL IDENTIFICATION===
Protocol type, variant, speed, voltage levels, addressing.

===TIMING DIAGRAM===
Draw an ASCII timing diagram showing signal transitions:

SCL  _____|--|_____|--|_____
SDA  _____|________|_______

Label each phase: START, ADDR, ACK, DATA, STOP

===TIMING ANALYSIS===
Table: Parameter | Required | Measured | Pass/Fail

===VIOLATIONS DETECTED===
Severity (ERROR/WARNING/INFO) | Description | Affected Signal | Fix

===FIX RECOMMENDATIONS===
Numbered list of specific corrective actions with values.`


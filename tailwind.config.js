export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        scope: {
          bg:     '#04070a',
          panel:  '#080d12',
          glass:  'rgba(8,13,18,0.75)',
          border: '#142030',
          green:  '#00ff88',
          cyan:   '#00d4ff',
          amber:  '#ffab40',
          red:    '#ff4560',
          purple: '#a855f7',
          muted:  '#2a3d50',
          text:   '#dde8f2',
          dim:    '#6b8499',
        }
      },
      backgroundImage: {
        'circuit-grid': `
          linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)
        `,
        'glow-green': 'radial-gradient(ellipse at center, rgba(0,255,136,0.08) 0%, transparent 70%)',
        'glow-cyan':  'radial-gradient(ellipse at center, rgba(0,212,255,0.06) 0%, transparent 70%)',
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0,255,136,0.2), 0 0 60px rgba(0,255,136,0.04)',
        'glow-cyan':  '0 0 20px rgba(0,212,255,0.2), 0 0 60px rgba(0,212,255,0.04)',
        'glow-sm':    '0 0 8px rgba(0,255,136,0.3)',
        'panel':      '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      animation: {
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
        'trace-move':  'traceMove 4s linear infinite',
        'flicker':     'flicker 8s ease-in-out infinite',
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.25s ease-out',
      },
      keyframes: {
        traceMove: {
          '0%':   { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%':      { opacity: '1' },
          '93%':      { opacity: '0.6' },
          '94%':      { opacity: '1' },
          '96%':      { opacity: '0.8' },
          '97%':      { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    }
  },
  plugins: []
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces
        'gw-bg':     'var(--gw-bg)',
        'gw-bg1':    'var(--gw-bg1)',
        'gw-bg2':    'var(--gw-bg2)',
        'gw-bg3':    'var(--gw-bg3)',
        // Borders
        'gw-border':    'var(--gw-border)',
        'gw-border-hi': 'var(--gw-border-hi)',
        // Text
        'gw-text':  'var(--gw-text)',
        'gw-sub':   'var(--gw-sub)',
        'gw-muted': 'var(--gw-muted)',
        // Fern (green / primary)
        'gw-fern':      'var(--gw-fern)',
        'gw-fern-hi':   'var(--gw-fern-hi)',
        'gw-fern-dim':  'var(--gw-fern-dim)',
        'gw-fern-bg':   'var(--gw-fern-bg)',
        'gw-fern-text': 'var(--gw-fern-text)',
        // Amber
        'gw-amber':     'var(--gw-amber)',
        'gw-amber-dim': 'var(--gw-amber-dim)',
        'gw-amber-bg':  'var(--gw-amber-bg)',
        // Red
        'gw-red':     'var(--gw-red)',
        'gw-red-dim': 'var(--gw-red-dim)',
        'gw-red-bg':  'var(--gw-red-bg)',
        // Cyan
        'gw-cyan':     'var(--gw-cyan)',
        'gw-cyan-dim': 'var(--gw-cyan-dim)',
        'gw-cyan-bg':  'var(--gw-cyan-bg)',
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0f1e',
        navy: { 950: '#060a15', 900: '#0a0f1e', 800: '#0f1629', 700: '#151e38', 600: '#1d2a4d', 500: '#2a3a66' },
        cyan: { DEFAULT: '#00d4ff', 50: '#e6fbff', 100: '#b3f2ff', 200: '#80eaff', 300: '#4de1ff', 400: '#1ad9ff', 500: '#00d4ff', 600: '#00a9cc', 700: '#007f99' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 212, 255, 0.35)',
        'glow-lg': '0 0 48px rgba(0, 212, 255, 0.45)',
      },
    },
  },
  plugins: [],
};

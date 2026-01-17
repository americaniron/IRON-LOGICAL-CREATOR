/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'heavy-yellow': '#FFC20E',
        'safety-orange': '#F97316',
        'asphalt': '#111317',
        'steel': '#23272F',
        'industrial-gray': '#4A515A',
        'text-light': '#EAEAEA',
        'text-muted': '#88929E',
        'guest-green': '#22c55e',
        'grok-magenta': '#d946ef',
      },
      fontFamily: {
        heading: ['Black Ops One', 'sans-serif'],
        body: ['Share Tech Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

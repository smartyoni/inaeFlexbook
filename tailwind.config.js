/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Notion-inspired color palette
        notion: {
          blue: '#0a66ff',
          red: '#d93026',
          green: '#0a942f',
          yellow: '#b8860b',
          purple: '#6965db',
          pink: '#d946ef',
        }
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

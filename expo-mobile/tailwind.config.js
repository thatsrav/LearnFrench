/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './global.css', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        display: ['PlayfairDisplay_700Bold'],
        'display-semi': ['PlayfairDisplay_600SemiBold'],
        sans: ['Inter_400Regular'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
      },
      colors: {
        fl: {
          bg: '#f8f9fb',
          ink: '#0f172a',
          indigo: '#4f46e5',
          blue: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}

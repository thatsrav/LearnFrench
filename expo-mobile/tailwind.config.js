/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './global.css', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {} },
  plugins: [],
}

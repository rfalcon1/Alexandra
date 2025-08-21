/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: { '2xl': '1rem' },
      boxShadow: { 'soft': '0 10px 30px rgba(0,0,0,0.08)' }
    },
  },
  plugins: [],
}
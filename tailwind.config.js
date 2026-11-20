/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './context/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // High-fashion gallery monochrome palette (Bluorng / Represent / Kith aesthetic)
        obsidian: '#FFFFFF',
        charcoal: '#F6F5F2',
        surface: '#ECEAE4',
        panel: '#E5E3DC',
        bone: '#0B0B0C',
        ash: '#6B6A66',
        acid: '#0B0B0C',
        crimson: '#B91C1C',
        ink: '#0B0B0C',
        stoneBg: '#F6F5F2',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        condensed: ['var(--font-condensed)', 'Helvetica Neue', 'sans-serif'],
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

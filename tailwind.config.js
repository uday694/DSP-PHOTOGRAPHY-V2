/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050507',
        charcoal: '#0E0E12',
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5E6B3',
          dark: '#9C7A1C',
        },
        ivory: '#F7F6F2',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

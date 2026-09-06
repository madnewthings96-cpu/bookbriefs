/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'Inter', 'Lato', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'serif'],
        arabic: ['Amiri', '"Scheherazade New"', 'sans-serif'],
      },
      colors: {
        primary: '#143D2D', // Forest Green Primary
        forest: {
          50: '#F2F7F4',
          100: '#E5EFE9',
          200: '#C8DDD2',
          300: '#9EC3B2',
          400: '#6DA38D',
          500: '#46856C',
          600: '#2F6B53',
          700: '#1F5340',
          800: '#143D2D', // Primary Brand
          900: '#0C281E', // Dark Contrast
          950: '#061610',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F1E9D7',
        },
      },
      boxShadow: {
        'card-rest': '0 1px 3px rgba(12, 40, 30, 0.04), 0 10px 28px -4px rgba(12, 40, 30, 0.06)',
        'card-hover': '0 4px 8px -1px rgba(12, 40, 30, 0.06), 0 20px 40px -6px rgba(12, 40, 30, 0.12)',
        'glow-forest': '0 0 35px rgba(20, 61, 45, 0.18)',
        'book': '0 12px 28px -6px rgba(12, 35, 26, 0.25), 0 3px 8px -2px rgba(12, 35, 26, 0.15)',
      },
      animation: {
        'bubble-morph': 'bubble-morph 8s ease-in-out infinite',
        'bubble-rotate': 'bubble-rotate 12s linear infinite',
      },
      keyframes: {
        'bubble-morph': {
          '0%, 100%': {
            transform: 'scale(1) translate(0%, 0%)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          },
          '25%': {
            transform: 'scale(1.05) translate(5%, -5%)',
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          },
          '50%': {
            transform: 'scale(0.95) translate(-5%, 5%)',
            borderRadius: '50% 60% 30% 60% / 30% 60% 70% 40%',
          },
          '75%': {
            transform: 'scale(1.02) translate(3%, 3%)',
            borderRadius: '60% 40% 60% 40% / 70% 30% 50% 60%',
          },
        },
        'bubble-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

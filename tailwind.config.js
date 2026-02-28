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
        sans: ['Lato', 'sans-serif'],
      },
      colors: {
        primary: '#2F4F4F', // Dark slate gray
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

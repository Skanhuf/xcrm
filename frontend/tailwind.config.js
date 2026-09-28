/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0e27',
          900: '#070a1f',
          800: '#0d1233',
          700: '#121840',
        },
        card: {
          DEFAULT: '#141a3a',
          900: '#1a214a',
          800: '#1f2754',
        },
        accent: {
          DEFAULT: '#3b82f6',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
        },
        surface: {
          DEFAULT: '#1e2548',
          900: '#252d56',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.2)',
      }
    },
  },
  plugins: [],
}

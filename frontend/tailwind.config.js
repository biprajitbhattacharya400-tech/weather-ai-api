/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        skyMist: '#8FAFD9',
        softIndigo: '#7C86B8',
        hazeViolet: '#9A95B8',
        cloudSurface: '#F3F6FB',
        inkPrimary: '#111827',
        inkSecondary: '#5B6474',
        inkTertiary: '#8A94A6',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0 16px 50px rgba(36, 56, 89, 0.14)',
        glow: '0 0 56px rgba(245, 249, 255, 0.55)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-2%,0) scale(1.02)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.62' },
        },
      },
      animation: {
        drift: 'drift 16s ease-in-out infinite',
        breathe: 'breathe 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

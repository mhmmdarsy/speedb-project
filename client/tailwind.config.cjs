/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        primary: {
          DEFAULT: '#0284c7',
          dark: '#0369a1',
          light: '#7dd3fc',
        },
        secondary: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
};

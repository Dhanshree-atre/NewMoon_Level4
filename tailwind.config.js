/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#060814',
          800: '#0c1024',
          700: '#141c38',
          600: '#1e294b',
          500: '#314275',
          cyan: '#00f2fe',
          purple: '#7928ca',
          accent: '#4facfe',
        },
      },
    },
  },
  plugins: [],
};

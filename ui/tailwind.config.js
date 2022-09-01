/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand_lightblue: '#EFF6FF',
        brand_gray1: '#D1D5DB',
        brand_gray2: '#6B7280',
        brand_gray3: '#9CA3AF',
        brand_black: '#111827',
        brand_black2: '#374151'
      }
    }
  },
  plugins: []
};

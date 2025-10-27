/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
      colors: {
        primary: '#667eea',
        'primary-dark': '#5a67d8',
        secondary: '#764ba2',  // Changed: was green, now purple
        success: '#48bb78',     // Changed: updated hex
        danger: '#f56565',
        warning: '#f6ad55',     // Changed: updated hex
        dark: '#2d3748',
        light: '#f7fafc',
        gray: '#718096',
      },
    },
  },
  plugins: [],
}
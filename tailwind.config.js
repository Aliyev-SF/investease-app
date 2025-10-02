/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        'primary-dark': '#5a67d8',
        secondary: '#48bb78',
        danger: '#f56565',
        warning: '#ed8936',
        dark: '#2d3748',
        light: '#f7fafc',
        gray: '#718096',
        success: '#38a169',
      },
    },
  },
  plugins: [],
}
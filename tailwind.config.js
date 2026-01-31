/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mc: ["'Minecraft'", 'monospace'],
        'mc-bold': ["'Minecraft-Bold'", 'monospace'],
        'mc-five': ["'MinecraftFive'", 'monospace'],
      },
      colors: {
        mc: {
          dark: '#1e1e1f',
          bg: '#48494a',
          'bg-dark': '#313233',
          'bg-light': '#5a5b5c',
          green: '#3c8527',
          'green-light': '#4ca632',
          'green-dark': '#2d6a1e',
          red: '#8b2020',
          'red-light': '#a52a2a',
          'red-dark': '#6a1818',
          nav: '#1c1c1d',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.3' },
          '25%':      { transform: 'translateY(-20px) translateX(10px)', opacity: '0.5' },
          '50%':      { transform: 'translateY(-40px) translateX(-10px)', opacity: '0.7' },
          '75%':      { transform: 'translateY(-20px) translateX(5px)', opacity: '0.5' },
        },
      },
      animation: {
        float: 'float 15s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}

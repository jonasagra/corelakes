/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // corpo/UI: San Francisco (leitura); Minecraft fica só decorativa
        sans: ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['"SF Pro Display"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // `font-mc` era Monocraft (pixel) — remapeado para SF: todo texto de
        // leitura do site (navbar, footer, admin) migra sem tocar componente.
        mc: ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // decorativas (título do blog e afins)
        'mc-bold': ["'Minecraft-Bold'", 'monospace'],
        'mc-five': ["'MinecraftFive'", 'monospace'],
        // Minercraftory substituiu a MinecraftTen (tem acentos)
        'mc-ten': ["'Minercraftory'", 'monospace'],
        // pixel (Monocraft.ttf — registrada como 'Minecraft' no @font-face)
        'mc-pixel': ["'Minecraft'", 'monospace'],
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
          'green-bright': '#6cc349',
          'green-link': '#a0e081',
          red: '#8b2020',
          'red-light': '#a52a2a',
          'red-dark': '#6a1818',
          nav: '#111112',
          black: '#0b0b0c',
          panel: '#1b1b1c',
          line: '#2a2a2b',
          gold: '#ffb12b',
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
      animation: { float: 'float 15s infinite ease-in-out' },
    },
  },
  plugins: [],
}

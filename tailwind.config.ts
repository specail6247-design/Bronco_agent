import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm cream palette
        cream: {
          50: '#FFFDF8',
          100: '#FFF9ED',
          200: '#FFF3DB',
          300: '#FFE9C2',
          400: '#FFDCA3',
          500: '#FFCF84',
        },
        // Agent brand colors
        agent: {
          jessica: '#E8B4B8', // soft rose
          sunny: '#FFD93D',   // warm yellow
          rovert: '#6BCB77',  // fresh green
          tim: '#4D96FF',     // sky blue
          david: '#9B59B6',   // purple
          john: '#34495E',    // slate
        },
        // Status colors
        status: {
          waiting: '#94A3B8',
          working: '#F59E0B',
          done: '#10B981',
          failed: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

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
      screens: {
        xs: '375px',
      },
      colors: {
        // Liquid Glass Dark Mode Palette
        glass: {
          bg: 'rgba(255, 255, 255, 0.08)',
          'bg-hover': 'rgba(255, 255, 255, 0.12)',
          'bg-elevated': 'rgba(255, 255, 255, 0.12)',
          'bg-elevated-hover': 'rgba(255, 255, 255, 0.16)',
          border: 'rgba(255, 255, 255, 0.1)',
          'border-bright': 'rgba(255, 255, 255, 0.2)',
        },
        // Apple System Colors (Dark Mode)
        apple: {
          bg: '#000000',
          'bg-secondary': '#1C1C1E',
          'bg-tertiary': '#2C2C2E',
          label: '#FFFFFF',
          'label-secondary': 'rgba(255, 255, 255, 0.6)',
          'label-tertiary': 'rgba(255, 255, 255, 0.3)',
          blue: '#0A84FF',
          green: '#30D158',
          red: '#FF453A',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
          purple: '#BF5AF2',
          separator: 'rgba(84, 84, 88, 0.65)',
          gray: '#8E8E93',
          'gray-2': '#636366',
          'gray-3': '#48484A',
          'gray-4': '#3A3A3C',
          'gray-5': '#2C2C2E',
          'gray-6': '#1C1C1E',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'glass': '16px',
        'glass-sm': '12px',
        'glass-lg': '20px',
        'glass-xl': '24px',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-heavy': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-elevated': '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-subtle': '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'glass-shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

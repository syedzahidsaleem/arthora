import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          primary: '#6C63FF',
          secondary: '#00D2FF',
          accent: '#FF6B6B',
          DEFAULT: '#6C63FF',
        },
        surface: {
          1: '#0D0E1A', // Base canvas dark background
          2: '#13141F', // Card & elevated surface
          3: '#1A1B2E', // Hover state & active component
          4: '#22233A', // Highlighted border / overlay
          DEFAULT: '#13141F',
        },
        content: {
          primary: '#F0F0FA',
          secondary: '#9B9BB4',
          muted: '#5A5A7A',
        },
        feedback: {
          success: '#00D084',
          warning: '#FFB344',
          error: '#FF4D6D',
        },
        success: '#00D084',
        warning: '#FFB344',
        error: '#FF4D6D',
        chart: {
          1: '#6C63FF',
          2: '#00D2FF',
          3: '#00D084',
          4: '#FFB344',
          5: '#FF6B6B',
          6: '#9B51E0',
          7: '#F2994A',
          8: '#56CCF2',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        neo: {
          yellow: '#FFDE59',
          lime: '#00F59B',
          green: '#00F59B',
          cyan: '#38E1FF',
          pink: '#FF66C4',
          purple: '#A259FF',
          orange: '#FF7A00',
          black: '#121214',
          canvas: '#0D0E15',
          card: '#18181F',
          border: '#000000',
          white: '#FFFFFF',
          cream: '#FFFDF8',
        },
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        neo: '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-yellow': '4px 4px 0px 0px #FFDE59',
        'neo-cyan': '4px 4px 0px 0px #38E1FF',
        'neo-pink': '4px 4px 0px 0px #FF66C4',
        'neo-lime': '4px 4px 0px 0px #00F59B',
        'neo-white': '4px 4px 0px 0px #FFFFFF',
        'neo-inset': 'inset 2px 2px 0px 0px #000000',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.4s ease-out',
        marquee: 'marquee 25s linear infinite',
        'marquee-fast': 'marquee 15s linear infinite',
        'marquee-reverse': 'marquee-reverse 25s linear infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

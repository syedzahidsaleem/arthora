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
          primary: '#7BED9F', // Pastel Mint Green
          secondary: '#4FBBBC', // Industrial Aqua
          accent: '#EC4624', // Rust Signal
          DEFAULT: '#7BED9F',
        },
        surface: {
          1: '#FBF7EE', // Architectural Cream
          2: '#FFFFFF', // Crisp Paper White
          3: '#DDD3FF', // Soft Lilac Container
          4: '#E2DAC2', // Architectural Sand
          iron: '#222A2A', // Iron Core Dark
          DEFAULT: '#FFFFFF',
        },
        content: {
          primary: '#18181B', // Deep Charcoal
          secondary: '#525866', // Slate Muted
          muted: '#717684',
        },
        feedback: {
          success: '#7BED9F',
          warning: '#F39120',
          error: '#EC4624',
        },
        success: '#7BED9F',
        warning: '#F39120',
        error: '#EC4624',
        chart: {
          1: '#7BED9F', // Mint
          2: '#4FBBBC', // Aqua
          3: '#F39120', // Heat Marker
          4: '#EC4624', // Rust Signal
          5: '#C9BAF8', // Lilac
          6: '#222A2A', // Iron Core
          7: '#FFF7C2', // Butter
          8: '#FF6B6B', // Coral
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
          cream: '#FBF7EE', // Base Architectural Canvas
          sand: '#E2DAC2', // Warm Architectural Sand
          mint: '#7BED9F', // Pastel Mint Green
          green: '#7BED9F',
          lime: '#7BED9F',
          yellow: '#FFF7C2', // Butter Yellow
          aqua: '#4FBBBC', // Industrial Aqua
          cyan: '#4FBBBC',
          rust: '#EC4624', // Rust Signal
          coral: '#FF6B6B',
          orange: '#F39120', // Heat Marker
          pink: '#FF9F89', // Warm Peach
          lilac: '#DDD3FF', // Soft Lilac
          purple: '#C9BAF8',
          iron: '#222A2A', // Iron Core Deep Contrast
          black: '#18181B',
          canvas: '#FBF7EE',
          card: '#FFFFFF',
          border: '#000000',
          white: '#FFFFFF',
        },
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        neo: '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-yellow': '4px 4px 0px 0px #FFF7C2',
        'neo-cyan': '4px 4px 0px 0px #4FBBBC',
        'neo-mint': '4px 4px 0px 0px #7BED9F',
        'neo-pink': '4px 4px 0px 0px #FF9F89',
        'neo-lilac': '4px 4px 0px 0px #DDD3FF',
        'neo-lime': '4px 4px 0px 0px #7BED9F',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.4s ease-out',
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee 25s linear infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

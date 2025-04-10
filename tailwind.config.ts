import { DM_Sans } from "next/font/google";
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dmSans: ['DM Sans', 'sans-serif']
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shine: 'shimmer 8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scale': 'scaleText 3s ease-in-out infinite',
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(to bottom right, hsl(270, 100%, 49%), hsl(224, 100%, 60%))",
        'gradient-shine': 'linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)',
      },
      keyframes: {
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 4px rgba(66, 133, 244, 0)' },
          '50%': { textShadow: '0 0 4px rgba(66, 133, 244, 0.3)' },
        },
        scaleText: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require("tailwindcss-animate"),
    function ({ addUtilities }: any) {
      addUtilities({
        ".scrollbar-none": {
          "::-webkit-scrollbar": {
            display: "none",
          } /* Hide scrollbar for Chrome, Safari, and Opera */,
          "scrollbar-width": "none" /* Hide scrollbar for Firefox */,
        },
        ".text-gradient": {
          backgroundImage:
            "linear-gradient(to right, hsl(270, 100%, 49%), hsl(224, 100%, 60%))",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          color: "transparent",
        },
      });
    },
  ],
} satisfies Config;

import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ─── Spacing Scale ─── */
      spacing: {
        '4.5': '1.125rem',   // 18px
        '13': '3.25rem',     // 52px
        '15': '3.75rem',     // 60px
        '18': '4.5rem',      // 72px
        '22': '5.5rem',      // 88px
      },

      /* ─── Color System ─── */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#0b1326",
        foreground: "#dae2fd",
        primary: {
          DEFAULT: "#bfc2ff",
          foreground: "#141994",
        },
        secondary: {
          DEFAULT: "#ffb4a8",
          foreground: "#690100",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "secondary-fixed-dim": "#ffb4a8",
        "surface-container-highest": "#2d3449",
        "surface-container": "#171f33",
        "on-primary-fixed": "#00006e",
        "error-container": "#93000a",
        "primary-fixed-dim": "#bfc2ff",
        "inverse-primary": "#4951c3",
        "tertiary-fixed-dim": "#e9c400",
        "on-surface-variant": "#c6c5d5",
        "surface": "#0b1326",
        "on-error": "#690005",
        "surface-container-lowest": "#060e20",
        "on-secondary-fixed-variant": "#930100",
        "on-tertiary": "#3a3000",
        "on-tertiary-fixed-variant": "#544600",
        "tertiary": "#e9c400",
        "on-background": "#dae2fd",
        "on-tertiary-fixed": "#221b00",
        "on-primary": "#141994",
        "error": "#ffb4ab",
        "surface-container-low": "#131b2e",
        "outline-variant": "#454653",
        "tertiary-container": "#c9a900",
        "on-secondary-fixed": "#410000",
        "on-error-container": "#ffdad6",
        "primary-fixed": "#e0e0ff",
        "surface-bright": "#31394d",
        "secondary-fixed": "#ffdad4",
        "surface-dim": "#0b1326",
        "surface-variant": "#2d3449",
        "on-tertiary-container": "#4c3e00",
        "on-primary-fixed-variant": "#3037aa",
        "on-secondary": "#690100",
        "inverse-on-surface": "#283044",
        "tertiary-fixed": "#ffe16d",
        "inverse-surface": "#dae2fd",
        "on-surface": "#dae2fd",
        "outline": "#908f9f",
        "surface-container-high": "#222a3d",
        "secondary-container": "#ff5540",
        "surface-tint": "#bfc2ff",
        "on-primary-fixed-container": "#7981f5",
        "primary-container": "#00008b",
        "on-secondary-container": "#5c0000"
      },

      /* ─── Typography ─── */
      fontFamily: {
        "manrope": ["Manrope", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "title-sm": ["Manrope", "sans-serif"],
        "headline-md": ["Manrope", "sans-serif"],
        "display-lg": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-xs": ["10px", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "700" }],
        "title-sm": ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        "headline-md": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }]
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      /* ─── Keyframes ─── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(calc(-100% - var(--gap)))" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },

      /* ─── Animations ─── */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-reverse": "marquee-reverse var(--duration) linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-fast": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

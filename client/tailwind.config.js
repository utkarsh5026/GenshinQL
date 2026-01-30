/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "#6cb2eb",
          dark: "#2779bd",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        background: "hsl(var(--background))",
        text: {
          DEFAULT: "#2d3748",
          light: "#4a5568",
        },
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
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
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Game-specific colors for Genshindle
        game: {
          correct: {
            DEFAULT: "#22c55e", // green-500
            light: "#4ade80", // green-400
            dark: "#16a34a", // green-600
            bg: "#15803d", // green-700
          },
          wrong: {
            DEFAULT: "#ef4444", // red-500
            light: "#f87171", // red-400
            dark: "#dc2626", // red-600
            bg: "#b91c1c", // red-700
          },
          partial: {
            DEFAULT: "#f59e0b", // amber-500
            light: "#fbbf24", // amber-400
            dark: "#d97706", // amber-600
          },
          neutral: "#64748b", // slate-500
          hover: "#3b82f6", // blue-500
        },
        genshin: {
          gold: "#fbbf24", // amber-400 (Genshin signature gold)
          purple: "#a855f7", // purple-500 (wish banner purple)
          blue: "#60a5fa", // blue-400
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        woosh: {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)",
          },
          "70%": {
            transform: "scale(1.3)",
            boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)",
          },
          "100%": {
            transform: "scale(1.5)",
            boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5", filter: "blur(8px)" },
          "50%": { opacity: "0.8", filter: "blur(12px)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-1deg)" },
          "75%": { transform: "rotate(1deg)" },
        },
        pulse: {
          "0%": { opacity: "0.8", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "0.8", transform: "scale(1)" },
        },
      },
      animation: {
        woosh: "woosh 0.4s ease-out forwards",
        shimmer: "shimmer 3s linear infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        slideIn: "slideIn 0.3s ease-out",
        fadeIn: "fadeIn 0.5s ease-out",
        shake: "shake 0.3s ease-in-out",
        wiggle: "wiggle 0.4s ease-in-out",
        pulse: "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
};

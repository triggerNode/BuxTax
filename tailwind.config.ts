import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      typography: {
        brand: {
          css: {
            "--tw-prose-body": "hsl(var(--foreground))",
            "--tw-prose-headings": "hsl(var(--black))",
            "--tw-prose-lead": "hsl(var(--black))",
            "--tw-prose-links": "hsl(var(--royal))",
            "--tw-prose-bold": "hsl(var(--black))",
            "--tw-prose-counters": "hsl(var(--black))",
            "--tw-prose-bullets": "hsl(var(--royal))",
            "--tw-prose-hr": "hsl(var(--border))",
            "--tw-prose-quotes": "hsl(var(--burgundy))",
            "--tw-prose-quote-borders": "hsl(var(--royal))",
            "--tw-prose-captions": "hsl(var(--black))",
            "--tw-prose-code": "hsl(var(--black))",
            "--tw-prose-pre-code": "hsl(var(--black))",
            "--tw-prose-pre-bg": "hsl(var(--cream))",
            "--tw-prose-th-borders": "hsl(var(--border))",
            "--tw-prose-td-borders": "hsl(var(--border))",
          },
        },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        action: {
          DEFAULT: "hsl(var(--action))",
          foreground: "hsl(var(--action-foreground))",
          hover: "hsl(var(--action-hover))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        // Keep the accent version separately to avoid key collisions with the brand flat color.
        burgundyAccent: {
          DEFAULT: "hsl(var(--burgundy-accent))",
          foreground: "hsl(var(--burgundy-foreground))",
        },
        chart: {
          blue: "hsl(var(--chart-blue))",
          purple: "hsl(var(--chart-purple))",
          green: "hsl(var(--chart-green))",
          orange: "hsl(var(--chart-orange))",
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
        // BuxTax brand colors (Oishii guide)
        brand: {
          cream: "hsl(var(--cream))", // #FAFAED
          royal: "hsl(var(--royal))", // #1820EF
          cherry: "hsl(var(--cherry))", // #FF4E42
          yellow: "hsl(var(--yellow))", // #FFC024
          burgundy: "hsl(var(--burgundy))", // #832626
          black: "hsl(var(--black))", // #000000
        },
        // Temporary flat aliases (back-compat during migration)
        cream: "hsl(var(--cream))",
        royal: "hsl(var(--royal))",
        black: "hsl(var(--black))",
        cherry: "hsl(var(--cherry))",
        yellow: "hsl(var(--yellow))",
        burgundy: "hsl(var(--burgundy))",
      },
      fontFamily: {
        rounded: ['"Rounded Mplus 1c"', "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
} satisfies Config;

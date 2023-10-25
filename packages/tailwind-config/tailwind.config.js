module.exports = {
  theme: {
    extend: {
      colors: {},
    },
  },
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./core/**/*.{js,ts,jsx,tsx}",
    "./engine/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",

          // deprecated --- start using shadcn/ui

          100: "hsl(245 66% 95%)",
          200: "hsl(245 66% 90%)",
          300: "hsl(245 66% 82%)",
          400: "hsl(245 66% 75%)",
          500: "hsl(245, 66%, 65%)",
          600: "hsl(245 63% 56%)",
          700: "hsl(247, 42%, 34%)",
          // ---
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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

        // deprecated --- start using shadcn/ui

        current: "currentColor",
        alert: {
          500: "hsl(3 63% 60%)",
        },
        /** the same as GitHub Light Default theme
         * https://github.com/primer/github-vscode-theme
         * TODO: create a theme for CodePortal based on it's colors
         */
        code: {
          bg: "#ffffff",
          "bg-hover": "rgb(245, 245, 245)",
          delimiter: "#d4d5d5",
          name: "#24292f",
          "name-light": "#5a5c63",
          keyword: "#cf222e",
          symbol: "#cf222e",
          callable: "#8250df",
          string: "#0a3069",
          number: "#0550ae",
          boolean: "#0550ae",
          constant: "#0550ae",
          types: "#953800",
          "empty-expression": "rgb(233, 233, 233)",
          "empty-expression-hover": "rgb(221, 221, 221)",
          //---
          "ui-element-name": "#116329",
        },
        // ---
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      // deprecated --- start using shadcn/ui

      width: {
        1536: "1536px",
      },
      height: {
        150: "37.5rem",
      },
      margin: {
        30: "7.5rem",
      },

      // ---
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
}

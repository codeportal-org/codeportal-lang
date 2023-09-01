const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./core/**/*.{js,ts,jsx,tsx}",
    "./engine/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        current: "currentColor",
        primary: {
          100: "hsl(245 66% 95%)",
          200: "hsl(245 66% 90%)",
          300: "hsl(245 66% 82%)",
          400: "hsl(245 66% 75%)",
          500: "hsl(245, 66%, 65%)",
          600: "hsl(245 63% 56%)",
          700: "hsl(247, 42%, 34%)",
        },
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
        },
      },
      width: {
        1536: "1536px",
      },
      height: {
        150: "37.5rem",
      },
      margin: {
        30: "7.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
}

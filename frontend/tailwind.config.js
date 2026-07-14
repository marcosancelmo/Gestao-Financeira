/** @type {import('tailwindcss').Config} */
function withOpacity(varName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${varName}) / ${opacityValue})`
    }
    return `rgb(var(${varName}))`
  }
}

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: withOpacity('--color-base'),
        panel: withOpacity('--color-panel'),
        elevated: withOpacity('--color-elevated'),
        border: withOpacity('--color-border'),
        primary: withOpacity('--color-text-primary'),
        secondary: withOpacity('--color-text-secondary'),
        muted: withOpacity('--color-text-muted'),
        accent: {
          DEFAULT: withOpacity('--color-accent'),
          hover: withOpacity('--color-accent-hover'),
          soft: withOpacity('--color-accent'),
        },
        positive: {
          DEFAULT: withOpacity('--color-positive'),
          soft: withOpacity('--color-positive'),
        },
        negative: {
          DEFAULT: withOpacity('--color-negative'),
          soft: withOpacity('--color-negative'),
        },
        destaque: withOpacity('--color-destaque'),
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}

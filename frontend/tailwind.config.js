/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // 'dark' class humein <html> tag pe lagana hoga to enable dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // in files ke andar jitni bhi tailwind classes use hongi, unhi ka CSS generate hoga
  ],
  theme: {
    extend: {
      colors: {
        // Humara apna color palette - "brand" naam se, taaki har jagah bg-brand-500 jaisa likh sakein
        brand: {
          50: "#f3f1ff",
          100: "#ebe5ff",
          200: "#d9ceff",
          300: "#bea6ff",
          400: "#9d70ff",
          500: "#7c3aed", // main accent color - electric violet
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b1476",
        },
        // dark theme background shades - pure black ki jagah thoda soft dark
        surface: {
          DEFAULT: "#0a0a0f", // sabse peeche ka background
          card: "#14141c",    // cards/panels
          hover: "#1c1c26",   // hover states
          border: "#26262f",  // borders
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
}

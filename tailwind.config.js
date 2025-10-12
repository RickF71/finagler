/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        finagler: {
          emerald: "#00B97A",   // original main emerald
          jade: "#2E8C47",      // from your extracted palette
          jadeDark: "#177430",  // deep grounding tone
          cobalt: "#3B82F6",    // main bright cobalt
          cobaltDeep: "#165260",// dark cobalt shadow
          mint: "#7FC692",      // soft highlight
          neutralDark: "#0A0F0D", // background
          neutralLight: "#F7FAF9", // text on dark
          harmony: "#E9A6A6",     // 🌸 Jikka field / empathy
          slate: {
            light: "#5A6A80",     // subtle UI elements, borders
            DEFAULT: "#2A3642",   // richer midtone slate (main)
            dark: "#131A21",      // nearly black; ideal sidebar/bg
          },
        },
      },
    },
  },
  plugins: [],
};

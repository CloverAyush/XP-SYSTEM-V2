/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#f4f7fb",
        line: "#d7dee8",
        accent: "#0f766e",
        accentDark: "#115e59"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

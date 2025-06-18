/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',      // App Router pages
    './pages/**/*.{js,ts,jsx,tsx}',    // Pages Router pages
    './components/**/*.{js,ts,jsx,tsx}'// Any shared components
  ],
  theme: {
    extend: {},                        // Add custom theming here
  },
  plugins: [],                         // Add Tailwind plugins here
};

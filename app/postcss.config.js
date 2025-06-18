// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // use the separate PostCSS plugin
    autoprefixer: {},            // keep vendor-prefixing support
  },
};

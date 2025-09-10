// Tailwind CSS v4: use the PostCSS plugin via object form so it's actually invoked.
// (Array of string names may not be resolved -> resulting in the CSS file being effectively empty.)
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;

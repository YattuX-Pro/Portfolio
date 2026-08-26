/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    /* Tailwind v4 : le plugin PostCSS a changé de nom de paquet. L'ancienne
       entrée `tailwindcss: {}` ne fait plus rien avec la v4 installée. */
    "@tailwindcss/postcss": {},
  },
};

export default config;

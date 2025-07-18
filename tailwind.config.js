module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  safelist: [
    'bg-primary-50',
    'dark:bg-primary-900/20',
    'text-primary-600',
    'dark:text-primary-400',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

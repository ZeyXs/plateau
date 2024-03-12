/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js}'],
    theme: {
        extend: {
            textShadow: {
                default: '0 2px 5px rgba(0, 0, 0, 0.5)',
                lg: '0 2px 10px rgba(0, 0, 0, 0.5)',
            },
        },
    },
    variants: {},
    plugins: [],
};

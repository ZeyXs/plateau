/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,js,ts,jsx,tsx}',
        'node_modules/flowbite-react/lib/esm/**/*.js',
    ],
    theme: {
        extend: {
            fontFamily: {
                custom: ['Jost', 'sans-serif'],
            },
        },
    },
    variants: {},
    plugins: [
        require('flowbite-react'),
    ],
};

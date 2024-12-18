// tailwind.config.js
module.exports = {
    darkMode: 'class',
    content: ['./**/*.{html,js}'],
    theme: {
        extend: {
            animation: {
                'fadeIn': 'fadeIn 0.4s ease-in'
            }
        }
    }
}
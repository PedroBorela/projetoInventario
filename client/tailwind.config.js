/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2c3e50',
                secondary: '#34495e',
                accent: '#3498db',
                light: '#ecf0f1',
                success: '#27ae60',
                warning: '#e67e22',
                error: '#e74c3c',
            }
        },
    },
    plugins: [],
}

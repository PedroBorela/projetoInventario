/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#264593',    // Azul Royal Profundo (Dominante)
                secondary: '#CFCDC6',  // Cinza Pedra (Botões/CTA)
                surface: '#1A1A1A',    // Preto Carvão (Fundo Escuro/Serviços)
                background: '#FFFFFF', // Branco (Fundo Padrão)
                'text-main': '#333333', // Cinza Escuro (Texto)
                accent: '#264593',     // Reusing Primary as Accent for consistency or keep specific accent if needed. Let's align with "Azul Primário" as dominant.
                success: '#27ae60',
                warning: '#e67e22',
                error: '#e74c3c',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

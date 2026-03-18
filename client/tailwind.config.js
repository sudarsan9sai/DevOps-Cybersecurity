/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#e8faf5',
                    100: '#b9f0de',
                    200: '#8ae6c7',
                    300: '#5bdcb0',
                    400: '#2cd299',
                    500: '#00c982',
                    600: '#00a86b',
                    700: '#008754',
                    800: '#00663d',
                    900: '#004526',
                },
                surface: {
                    primary: '#0a0e17',
                    secondary: '#111827',
                    card: '#1a2332',
                    elevated: '#1e293b',
                    hover: '#243044',
                },
                accent: {
                    green: '#00c982',
                    red: '#ef4444',
                    blue: '#3b82f6',
                    amber: '#f59e0b',
                    purple: '#8b5cf6',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
                glow: '0 0 20px rgba(0, 201, 130, 0.15)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.15)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
            },
        },
    },
    plugins: [],
};

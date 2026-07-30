/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === Charte graphique du projet ===
        primary: {
          DEFAULT: '#111827', // Noir profond
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0b0f1a',
        },
        // Tertiaire — Bleu électrique (teintes & shades 50→950)
        accent: {
          50: '#ebf4ff',
          100: '#d6e8ff',
          200: '#add1ff',
          300: '#7db5ff',
          400: '#4398ff',
          500: '#0A84FF', // base
          600: '#006ae6',
          700: '#0055bf',
          800: '#054596',
          900: '#0a3a78',
          950: '#06213f',
          DEFAULT: '#0A84FF',
          hover: '#006AE6', // survol bouton bleu (Acheter)
          dark: '#0a2540',
          light: '#e8f2ff',
        },
        // Secondaire — Blanc & échelle neutre (surfaces, fonds, bordures)
        neutral: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          DEFAULT: '#ffffff',
        },
        // Accent promotion — uniquement pour attirer l'œil sur les réductions
        promo: {
          DEFAULT: '#F97316', // Orange
          light: '#fff1e6',
        },
        midnight: '#0F172A', // Topbar (bleu-noir)
        muted: '#6B7280', // Texte secondaire
        surface: '#F8FAFC', // Fond clair
        line: '#E5E7EB',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
        tighter: '-0.03em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17,24,39,0.04), 0 2px 8px rgba(17,24,39,0.04)',
        card: '0 1px 3px rgba(17,24,39,0.06), 0 8px 24px -12px rgba(17,24,39,0.10)',
        'card-hover': '0 20px 48px -16px rgba(17,24,39,0.22)',
        glow: '0 8px 30px -8px rgba(10,132,255,0.45)',
        'inner-line': 'inset 0 0 0 1px rgba(17,24,39,0.06)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      backgroundImage: {
        'grid-line':
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
        float: 'float 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};

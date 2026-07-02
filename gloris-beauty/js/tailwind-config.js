tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#FFFFFF',
          secondary: '#FFFFFF',
        },
        text: {
          main: '#111111',
          muted: '#767676',
        },
        accent: {
          dark: '#000000',
        },
        card: {
          cream: '#F4F2EF',
          blue: '#E4EBF0',
          pink: '#F5D6D6',
        },
        brand: {
          pink: '#D4A5A5',
          gold: '#C9B99A',
          dark: '#111111',
        },
      },
      fontSize: {
        h2: ['clamp(1.5rem, 3.2vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        display: ['clamp(1.75rem, 2.5vw, 2rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        body: ['clamp(0.9375rem, 1vw, 1rem)', { lineHeight: '1.6' }],
        ui: ['11px', { letterSpacing: '0.08em', fontWeight: '500', lineHeight: '1' }],
        overline: ['clamp(0.625rem, 0.7vw, 0.6875rem)', { letterSpacing: '0.12em' }],
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        full: '9999px',
        btn: '9999px',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-in-out',
      },
      boxShadow: {
        card: 'none',
      },
    },
  },
};

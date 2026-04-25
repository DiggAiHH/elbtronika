/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(144, 80%, 97%)',
            '100': 'hsl(144, 80%, 94%)',
            '200': 'hsl(144, 80%, 86%)',
            '300': 'hsl(144, 80%, 76%)',
            '400': 'hsl(144, 80%, 64%)',
            '500': 'hsl(144, 80%, 50%)',
            '600': 'hsl(144, 80%, 40%)',
            '700': 'hsl(144, 80%, 32%)',
            '800': 'hsl(144, 80%, 24%)',
            '900': 'hsl(144, 80%, 16%)',
            '950': 'hsl(144, 80%, 10%)',
            DEFAULT: '#0f863e'
        },
        secondary: {
            '50': 'hsl(322, 69%, 97%)',
            '100': 'hsl(322, 69%, 94%)',
            '200': 'hsl(322, 69%, 86%)',
            '300': 'hsl(322, 69%, 76%)',
            '400': 'hsl(322, 69%, 64%)',
            '500': 'hsl(322, 69%, 50%)',
            '600': 'hsl(322, 69%, 40%)',
            '700': 'hsl(322, 69%, 32%)',
            '800': 'hsl(322, 69%, 24%)',
            '900': 'hsl(322, 69%, 16%)',
            '950': 'hsl(322, 69%, 10%)',
            DEFAULT: '#c6248b'
        },
        'neutral-50': '#000000',
        'neutral-100': '#ffffff',
        'neutral-200': '#f2f2f2',
        'neutral-300': '#2a2a2a',
        'neutral-400': '#1a1a1a',
        background: '#000000',
        foreground: '#000000'
    },
    fontFamily: {
        sans: [
            'Suisse',
            'sans-serif'
        ],
        body: [
            'SuisseMono',
            'sans-serif'
        ]
    },
    fontSize: {
        '12': [
            '12px',
            {
                lineHeight: 'normal'
            }
        ],
        '13': [
            '13px',
            {
                lineHeight: '16.25px'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: 'normal'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: 'normal'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: 'normal',
                letterSpacing: '-0.24px'
            }
        ],
        '26': [
            '26px',
            {
                lineHeight: 'normal'
            }
        ],
        '32': [
            '32px',
            {
                lineHeight: '32px',
                letterSpacing: '-0.64px'
            }
        ],
        '40': [
            '40px',
            {
                lineHeight: '44px',
                letterSpacing: '-0.8px'
            }
        ]
    },
    spacing: {
        '0': '1px',
        '1': '32px',
        '2': '40px',
        '3': '48px',
        '4': '61px',
        '5': '120px',
        '6': '419px'
    },
    borderRadius: {
        sm: '4px',
        lg: '12px',
        full: '9999px'
    },
    boxShadow: {
        sm: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px inset'
    },
    transitionDuration: {
        '100': '0.1s',
        '300': '0.3s',
        '500': '0.5s',
        '600': '0.6s',
        '1000': '1s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.23, 1, 0.32, 1)'
    },
    container: {
        center: true,
        padding: '48px'
    },
    maxWidth: {
        container: '2000px'
    }
},
  },
};

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#063B63',
          navyLight: '#0A4775',
          green: '#168B55',
          greenLight: '#39C96B',
          greenMuted: '#DDF5E9',
          action: '#169B5B',
          softBg: '#F4FAFC',
          textPrimary: '#0B3554',
          textSecondary: '#637A8C',
          border: '#DCE7EC',
        },
        primary: {
          dark: '#0E4C5B',
          DEFAULT: '#1C8FA6',
          hover: '#0C414E',
          light: '#E2F4F7',
        },
        accent: {
          DEFAULT: '#EE6C4D',
          hover: '#D95839',
          light: '#FDECE8',
        },
        success: {
          DEFAULT: '#3F9D7C',
          hover: '#348669',
          light: '#EBF7F2',
        },
        warning: {
          DEFAULT: '#F2B84B',
          hover: '#DFA336',
          light: '#FEF7EB',
        },
        slate: {
          DEFAULT: '#5E7078',
          light: '#EDF2F4',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        text: {
          DEFAULT: '#14232B',
          muted: '#5E7078',
        },
        background: '#F7FAFA',
        surface: '#FFFFFF',
        border: '#E5ECEE',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '22px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(14, 76, 91, 0.05), 0 1px 2px 0 rgba(14, 76, 91, 0.03)',
        card: '0 4px 16px -2px rgba(14, 76, 91, 0.08), 0 2px 6px -1px rgba(14, 76, 91, 0.04)',
        elevated: '0 12px 32px -4px rgba(14, 76, 91, 0.12), 0 4px 12px -2px rgba(14, 76, 91, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

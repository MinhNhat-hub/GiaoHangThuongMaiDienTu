import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './docs/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-surface-canvas)',
        card: 'var(--color-surface-card)',
        mint: {
          primary: 'var(--primitive-mint-primary)',
          secondary: 'var(--primitive-mint-secondary)',
          'secondary-dark': 'var(--primitive-mint-secondary-dark)',
          tertiary: 'var(--primitive-mint-tertiary)',
          'tertiary-hover': 'var(--primitive-mint-tertiary-hover)',
          'tertiary-active': 'var(--primitive-mint-tertiary-active)',
          neutral: 'var(--primitive-mint-neutral)',
          surface: 'var(--primitive-mint-surface)',
          'on-primary': 'var(--primitive-mint-on-primary)',
        },
        status: {
          pending: {
            bg: 'var(--status-pending-bg)',
            border: 'var(--status-pending-border)',
            fg: 'var(--status-pending-fg)',
          },
          processing: {
            bg: 'var(--status-processing-bg)',
            border: 'var(--status-processing-border)',
            fg: 'var(--status-processing-fg)',
          },
          completed: {
            bg: 'var(--status-completed-bg)',
            border: 'var(--status-completed-border)',
            fg: 'var(--status-completed-fg)',
          },
          warning: {
            bg: 'var(--status-warning-bg)',
            border: 'var(--status-warning-border)',
            fg: 'var(--status-warning-fg)',
          },
          danger: {
            bg: 'var(--status-danger-bg)',
            border: 'var(--status-danger-border)',
            fg: 'var(--status-danger-fg)',
          },
        },
      },
      borderRadius: {
        sm: 'var(--primitive-radius-sm)', // 6px
        md: 'var(--primitive-radius-md)', // 12px
        lg: 'var(--primitive-radius-lg)', // 20px
      },
      spacing: {
        sm: 'var(--primitive-spacing-sm)', // 8px
        md: 'var(--primitive-spacing-md)', // 16px
        lg: 'var(--primitive-spacing-lg)', // 32px
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-code)'],
      },
      fontSize: {
        display: ['var(--font-size-display)', {
          lineHeight: '1.1',
          letterSpacing: 'var(--letter-spacing-display)',
          fontWeight: '700',
        }],
        h1: ['var(--font-size-h1)', {
          lineHeight: '1.25',
          fontWeight: '700',
        }],
        body: ['var(--font-size-body)', {
          lineHeight: 'var(--line-height-body)',
        }],
        label: ['var(--font-size-label)', {
          letterSpacing: 'var(--letter-spacing-label)',
          fontWeight: '600',
        }],
      },
      minHeight: {
        touch: 'var(--touch-target-min)',
      },
      minWidth: {
        touch: 'var(--touch-target-min)',
      },
      transitionTimingFunction: {
        standard: 'var(--motion-ease-standard)',
      },
    },
  },
  plugins: [],
};

export default config;

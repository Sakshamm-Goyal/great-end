/**
 * Weekendly Design System
 * Centralized design tokens, components, and utilities
 */

import { cn } from './utils';

// Design Tokens
export const tokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
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
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  borderRadius: {
    none: '0px',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Theme variants
export const themes = {
  lazy: {
    name: 'Lazy',
    description: 'Slow & cozy',
    colors: {
      primary: tokens.colors.primary[500],
      secondary: tokens.colors.secondary[500],
      accent: tokens.colors.accent[500],
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      surface: '#ffffff',
      text: tokens.colors.secondary[900],
      muted: tokens.colors.secondary[500],
    },
  },
  adventurous: {
    name: 'Adventurous',
    description: 'Active & bold',
    colors: {
      primary: tokens.colors.success[500],
      secondary: tokens.colors.warning[500],
      accent: tokens.colors.error[500],
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      surface: '#ffffff',
      text: tokens.colors.secondary[900],
      muted: tokens.colors.secondary[500],
    },
  },
  family: {
    name: 'Family',
    description: 'Together time',
    colors: {
      primary: tokens.colors.accent[500],
      secondary: tokens.colors.primary[500],
      accent: tokens.colors.warning[500],
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
      surface: '#ffffff',
      text: tokens.colors.secondary[900],
      muted: tokens.colors.secondary[500],
    },
  },
} as const;

// Component variants
export const componentVariants = {
  button: {
    base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    variants: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary',
    },
    sizes: {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    },
  },
  card: {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    header: 'flex flex-col space-y-1.5 p-6',
    title: 'text-2xl font-semibold leading-none tracking-tight',
    description: 'text-sm text-muted-foreground',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0',
  },
  input: {
    base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  },
  badge: {
    base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants: {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-foreground',
    },
  },
} as const;

// Utility functions
export const designUtils = {
  // Color utilities
  getColor: (color: string, shade: number = 500) => {
    const [category, variant] = color.split('.');
    return tokens.colors[category as keyof typeof tokens.colors]?.[shade as keyof typeof tokens.colors.primary] || color;
  },

  // Spacing utilities
  getSpacing: (size: keyof typeof tokens.spacing) => tokens.spacing[size],

  // Typography utilities
  getFontSize: (size: keyof typeof tokens.typography.fontSize) => tokens.typography.fontSize[size],
  getFontWeight: (weight: keyof typeof tokens.typography.fontWeight) => tokens.typography.fontWeight[weight],

  // Shadow utilities
  getShadow: (size: keyof typeof tokens.shadows) => tokens.shadows[size],

  // Responsive utilities
  getBreakpoint: (size: keyof typeof tokens.breakpoints) => tokens.breakpoints[size],
} as const;

// Animation presets
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
} as const;

// Layout utilities
export const layout = {
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
  grid: {
    '2': 'grid grid-cols-1 md:grid-cols-2 gap-6',
    '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    '4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
  },
} as const;

// Component factory functions
export const createComponent = {
  button: (variant: keyof typeof componentVariants.button.variants = 'default', size: keyof typeof componentVariants.button.sizes = 'default') => {
    return cn(
      componentVariants.button.base,
      componentVariants.button.variants[variant],
      componentVariants.button.sizes[size]
    );
  },

  card: (variant: 'default' | 'outlined' | 'elevated' = 'default') => {
    const baseClasses = componentVariants.card.base;
    const variantClasses = {
      default: 'border-border',
      outlined: 'border-2 border-border',
      elevated: 'shadow-lg border-border',
    };
    return cn(baseClasses, variantClasses[variant]);
  },

  input: (variant: 'default' | 'error' | 'success' = 'default') => {
    const baseClasses = componentVariants.input.base;
    const variantClasses = {
      default: 'border-input focus-visible:ring-ring',
      error: 'border-destructive focus-visible:ring-destructive',
      success: 'border-success focus-visible:ring-success',
    };
    return cn(baseClasses, variantClasses[variant]);
  },

  badge: (variant: keyof typeof componentVariants.badge.variants = 'default') => {
    return cn(
      componentVariants.badge.base,
      componentVariants.badge.variants[variant]
    );
  },
} as const;

// Theme context utilities
export const themeUtils = {
  getThemeColors: (theme: keyof typeof themes) => themes[theme].colors,
  applyTheme: (theme: keyof typeof themes) => {
    const themeColors = themes[theme].colors;
    return {
      '--primary': themeColors.primary,
      '--secondary': themeColors.secondary,
      '--accent': themeColors.accent,
      '--background': themeColors.background,
      '--surface': themeColors.surface,
      '--text': themeColors.text,
      '--muted': themeColors.muted,
    };
  },
} as const;

// Accessibility utilities
export const a11y = {
  srOnly: 'sr-only',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50',
} as const;

// Export all utilities
export const designSystem = {
  tokens,
  themes,
  componentVariants,
  designUtils,
  animations,
  layout,
  createComponent,
  themeUtils,
  a11y,
} as const;

export default designSystem;

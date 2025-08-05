import type { Theme } from '@/types';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: 'light' | 'dark' = 'light';
  
  private themes: Record<string, Theme> = {
    light: {
      name: 'light',
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        accent: '#0066FF',
        accentAlt: '#FF0066',
        border: '#000000',
        shadow: '#000000'
      }
    },
    dark: {
      name: 'dark',
      colors: {
        background: '#0A0A0A',
        foreground: '#FFFFFF',
        accent: '#3399FF',
        accentAlt: '#FF3366',
        border: '#FFFFFF',
        shadow: '#FFFFFF'
      }
    }
  };

  private constructor() {
    this.loadTheme();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.applyTheme();
  }

  toggle(): string {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
    this.applyTheme();
    return this.currentTheme;
  }

  private applyTheme(): void {
    const theme = this.themes[this.currentTheme];
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]: [string, string]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    root.setAttribute('data-theme', this.currentTheme);
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }
}
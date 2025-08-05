import type { Theme } from '@/types';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: string = 'light';
  
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
    },
    neon: {
      name: 'neon',
      colors: {
        background: '#0D0D0D',
        foreground: '#00FF00',
        accent: '#FF00FF',
        accentAlt: '#00FFFF',
        border: '#00FF00',
        shadow: '#00FF00'
      }
    },
    sunset: {
      name: 'sunset',
      colors: {
        background: '#2A1810',
        foreground: '#FFEECC',
        accent: '#FF6B35',
        accentAlt: '#F7931E',
        border: '#FF6B35',
        shadow: '#FF6B35'
      }
    },
    ocean: {
      name: 'ocean',
      colors: {
        background: '#0B1426',
        foreground: '#E6F3FF',
        accent: '#00A8CC',
        accentAlt: '#0093B3',
        border: '#00A8CC',
        shadow: '#00A8CC'
      }
    },
    forest: {
      name: 'forest',
      colors: {
        background: '#1A2818',
        foreground: '#E8F5E8',
        accent: '#4CAF50',
        accentAlt: '#66BB6A',
        border: '#4CAF50',
        shadow: '#4CAF50'
      }
    },
    royal: {
      name: 'royal',
      colors: {
        background: '#1A0D26',
        foreground: '#F0E8FF',
        accent: '#9C27B0',
        accentAlt: '#FFD700',
        border: '#9C27B0',
        shadow: '#9C27B0'
      }
    },
    retro: {
      name: 'retro',
      colors: {
        background: '#000000',
        foreground: '#FFB000',
        accent: '#FF8000',
        accentAlt: '#FFC000',
        border: '#FFB000',
        shadow: '#FFB000'
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
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Validate saved theme exists, fallback to light/dark preference
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme();
  }

  toggle(): string {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
    this.applyTheme();
    return this.currentTheme;
  }

  setTheme(themeName: string): boolean {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      localStorage.setItem('theme', this.currentTheme);
      this.applyTheme();
      return true;
    }
    return false;
  }

  getAvailableThemes(): string[] {
    return Object.keys(this.themes);
  }

  getThemeDisplayName(themeName: string): string {
    const theme = this.themes[themeName];
    return theme ? theme.name : themeName;
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
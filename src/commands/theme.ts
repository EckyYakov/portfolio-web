import type { Command } from '@/types';
import { ThemeManager } from '@/ui/ThemeManager';
import { QuickSuggestions } from '@/ui/QuickSuggestions';

export const themeCommand: Command = {
  name: 'theme',
  description: 'Customize the colors of the website',
  aliases: ['dark', 'light'],
  suggestions: {
    subcommands: [
      { name: 'light', description: 'Switch to light theme' },
      { name: 'dark', description: 'Switch to dark theme' },
      { name: 'neon', description: 'Switch to neon cyberpunk theme' },
      { name: 'sunset', description: 'Switch to warm sunset theme' },
      { name: 'ocean', description: 'Switch to ocean blue theme' },
      { name: 'forest', description: 'Switch to forest green theme' },
      { name: 'royal', description: 'Switch to royal purple theme' },
      { name: 'retro', description: 'Switch to retro amber theme' }
    ]
  },
  handler: async (args: string[]) => {
    const themeManager = ThemeManager.getInstance();
    const availableThemes = themeManager.getAvailableThemes();
    
    // If no arguments, show theme picker
    if (args.length === 0) {
      return showThemePicker(themeManager, availableThemes);
    }
    
    // If argument provided, try to set that theme
    const requestedTheme = args[0].toLowerCase();
    const success = themeManager.setTheme(requestedTheme);
    
    if (success) {
      return showThemeChanged(themeManager, requestedTheme, availableThemes);
    } else {
      return showThemeError(requestedTheme, availableThemes);
    }
  }
};

function showThemePicker(themeManager: ThemeManager, availableThemes: string[]) {
  const currentTheme = themeManager.getCurrentTheme();
  const content = document.createElement('div');
  content.className = 'theme-content';
  
  const themeChips = availableThemes.map(theme => ({
    command: `/theme ${theme}`,
    label: `${theme}`,
    description: `Switch to ${theme} theme`
  }));
  
  content.innerHTML = `
    <div class="theme-section brutal-box">
      <h2 class="brutal-heading">Theme Selector</h2>
      <div class="theme-text">
        <p>Current theme: <strong>${currentTheme}</strong></p>
        <p>Choose a theme to switch to:</p>
      </div>
    </div>
    
    ${QuickSuggestions.generate(themeChips, 'Available Themes')}
  `;

  return {
    content,
    type: 'html' as const
  };
}

function showThemeChanged(_themeManager: ThemeManager, newTheme: string, availableThemes: string[]) {
  const content = document.createElement('div');
  content.className = 'theme-content';
  
  const otherThemes = availableThemes
    .filter(theme => theme !== newTheme)
    .map(theme => ({
      command: `/theme ${theme}`,
      label: `${theme}`,
      description: `Switch to ${theme} theme`
    }));
  
  content.innerHTML = `
    <div class="theme-section brutal-box">
      <h2 class="brutal-heading">Theme Changed</h2>
      <div class="theme-text">
        <p>Theme switched to <strong>${newTheme}</strong> mode</p>
        <p>Enjoy the new look! Try another theme or explore the portfolio.</p>
      </div>
    </div>
    
    ${QuickSuggestions.generate(otherThemes, 'Try Other Themes')}
    
    ${QuickSuggestions.generate([
      { command: '/theme', label: '/theme', description: 'Show all themes' },
      { command: '/resume', label: '/resume', description: 'View my resume with the new theme' },
      { command: '/about', label: '/about', description: 'Learn more about me' },
      { command: '/help', label: '/help', description: 'See all available commands' }
    ], 'Quick Commands')}
  `;

  return {
    content,
    type: 'html' as const
  };
}

function showThemeError(requestedTheme: string, availableThemes: string[]) {
  const content = document.createElement('div');
  content.className = 'theme-content';
  
  const themeChips = availableThemes.slice(0, 6).map(theme => ({
    command: `/theme ${theme}`,
    label: `${theme}`,
    description: `Switch to ${theme} theme`
  }));
  
  content.innerHTML = `
    <div class="theme-section brutal-box">
      <h2 class="brutal-heading">Theme Not Found</h2>
      <div class="theme-text">
        <p>Theme "<strong>${requestedTheme}</strong>" not found.</p>
        <p>Available themes: ${availableThemes.join(', ')}</p>
      </div>
    </div>
    
    ${QuickSuggestions.generate(themeChips, 'Available Themes')}
  `;

  return {
    content,
    type: 'html' as const
  };
}
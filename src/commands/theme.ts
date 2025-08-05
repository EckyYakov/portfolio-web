import type { Command } from '@/types';
import { ThemeManager } from '@/ui/ThemeManager';

export const themeCommand: Command = {
  name: 'theme',
  description: 'Toggle between light and dark theme',
  aliases: ['dark', 'light'],
  handler: async () => {
    const themeManager = ThemeManager.getInstance();
    const newTheme = themeManager.toggle();
    
    return {
      content: `Theme switched to ${newTheme} mode`,
      type: 'text'
    };
  }
};
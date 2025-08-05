import type { Command } from '@/types';
import { ThemeManager } from '@/ui/ThemeManager';
import { QuickSuggestions } from '@/ui/QuickSuggestions';

export const themeCommand: Command = {
  name: 'theme',
  description: 'Toggle between light and dark theme',
  aliases: ['dark', 'light'],
  handler: async () => {
    const themeManager = ThemeManager.getInstance();
    const newTheme = themeManager.toggle();
    
    const content = document.createElement('div');
    content.className = 'theme-content';
    
    content.innerHTML = `
      <div class="theme-section brutal-box">
        <h2 class="brutal-heading">Theme Changed</h2>
        <p>Theme switched to <strong>${newTheme} mode</strong></p>
        <p>Enjoy the new look! You can toggle between themes anytime.</p>
      </div>
      
      ${QuickSuggestions.generate([
        { command: '/theme', label: '/theme', description: 'Change the theme again' },
        { command: '/resume', label: '/resume', description: 'View my resume with the new theme' },
        { command: '/about', label: '/about', description: 'Learn more about me' },
        { command: '/help', label: '/help', description: 'See all available commands' },
        { command: '/clear', label: '/clear', description: 'Clear the screen' }
      ], 'Quick Commands')}
    `;

    return {
      content,
      type: 'html'
    };
  }
};
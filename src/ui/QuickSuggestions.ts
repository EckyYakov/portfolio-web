export interface SuggestionConfig {
  command: string;
  label: string;
  description?: string;
}

export class QuickSuggestions {
  static generate(suggestions: SuggestionConfig[], title: string = 'Quick Commands'): string {
    if (suggestions.length === 0) return '';
    
    return `
      <div class="quick-suggestions">
        <h3 class="suggestions-title">${title}</h3>
        <div class="command-suggestions">
          ${suggestions.map(suggestion => `
            <span 
              class="suggestion-chip" 
              onclick="window.terminal.executeSelectedCommand('${suggestion.command}')"
              title="${suggestion.description || ''}"
            >
              ${suggestion.label}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Predefined suggestion sets for common use cases
  static readonly MAIN_NAVIGATION: SuggestionConfig[] = [
    { command: '/resume', label: '/resume', description: 'View my full professional background' },
    { command: '/contact', label: '/contact', description: 'Get in touch with me' },
    { command: '/theme', label: '/theme', description: 'Customize the look of the website' },
    { command: '/help', label: '/help', description: 'See all available commands' }
  ];
  
  static readonly RESUME_VARIATIONS: SuggestionConfig[] = [
    { command: '/resume recent', label: '/resume recent', description: 'Current and recent positions' },
    { command: '/resume skills', label: '/resume skills', description: 'Technical skills only' },
    { command: '/resume projects', label: '/resume projects', description: 'Selected projects' },
    { command: '/resume --full-time-only', label: '/resume --full-time-only', description: 'Full-time positions only' },
    { command: '/help', label: '/help', description: 'See all available commands' }
  ];
  
  static readonly RESUME_EXPLORE: SuggestionConfig[] = [
    { command: '/about', label: '/about', description: 'Learn more about me' },
    { command: '/resume --since-year 2020', label: '/resume --since-year 2020', description: 'Experience since 2020' },
    { command: '/theme', label: '/theme', description: 'Switch between light/dark themes' },
    { command: '/help', label: '/help', description: 'See all available commands' }
  ];
  
  static readonly HELP_RELATED: SuggestionConfig[] = [
    { command: '/about', label: '/about', description: 'Learn about me' },
    { command: '/resume', label: '/resume', description: 'View my resume' },
    { command: '/theme', label: '/theme', description: 'Change theme' },
    { command: '/clear', label: '/clear', description: 'Clear the screen' }
  ];
}
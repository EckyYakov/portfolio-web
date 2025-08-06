import type { Command } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';
import { commands } from './index';

export const helpCommand: Command = {
  name: 'help',
  description: 'Show available commands',
  aliases: ['h', '?'],
  handler: async () => {
    const content = document.createElement('div');
    content.className = 'help-content';
    
    const commandListHtml = commands
      .map(command => `
          <div class="command-item">
            <span class="command-name">/${command.name}</span>
            <span class="command-desc">${command.description}</span>
          </div>`)
      .join('');
    
    content.innerHTML = `
      <div class="help-section brutal-box">
        <h2 class="brutal-heading">Available Commands</h2>
        <div class="command-list">
          ${commandListHtml}
        </div>
        <div class="help-tips">
          <h3>Tips</h3>
          <ul>
            <li>Use <span class="key-hint">Tab</span> for command autocomplete</li>
            <li>Use <span class="key-hint">↑/↓</span> arrows to navigate suggestions</li>
            <li>Use <span class="key-hint">Enter</span> to select highlighted suggestion</li>
            <li>Commands are case-insensitive</li>
            <li>Type / to see all commands</li>
          </ul>
        </div>
      </div>
      
      ${QuickSuggestions.generate(QuickSuggestions.HELP_RELATED, 'Quick Commands')}
    `;

    return {
      content,
      type: 'html'
    };
  }
};
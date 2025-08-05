import type { Command } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';

export const helpCommand: Command = {
  name: 'help',
  description: 'Show available commands',
  aliases: ['h', '?'],
  handler: async () => {
    const content = document.createElement('div');
    content.className = 'help-content';
    
    content.innerHTML = `
      <div class="help-section brutal-box">
        <h2 class="brutal-heading">Available Commands</h2>
        <div class="command-list">
          <div class="command-item">
            <span class="command-name">/help</span>
            <span class="command-desc">Show this help message</span>
          </div>
          <div class="command-item">
            <span class="command-name">/about</span>
            <span class="command-desc">Learn about me</span>
          </div>
          <div class="command-item">
            <span class="command-name">/resume</span>
            <span class="command-desc">View my professional experience</span>
          </div>
          <div class="command-item">
            <span class="command-name">/skills</span>
            <span class="command-desc">See my technical skills</span>
          </div>
          <div class="command-item">
            <span class="command-name">/projects</span>
            <span class="command-desc">Browse my portfolio projects</span>
          </div>
          <div class="command-item">
            <span class="command-name">/contact</span>
            <span class="command-desc">Get in touch with me</span>
          </div>
          <div class="command-item">
            <span class="command-name">/blog</span>
            <span class="command-desc">Read my blog posts (coming soon)</span>
          </div>
          <div class="command-item">
            <span class="command-name">/theme</span>
            <span class="command-desc">Toggle between light and dark theme</span>
          </div>
          <div class="command-item">
            <span class="command-name">/clear</span>
            <span class="command-desc">Clear the terminal</span>
          </div>
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
import type { Command } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';

export const aboutCommand: Command = {
  name: 'about',
  description: 'Learn about me',
  aliases: ['whoami'],
  handler: async () => {
    const content = document.createElement('div');
    content.className = 'about-content';
    
    content.innerHTML = `
      <div class="about-section brutal-box">
        <h2 class="brutal-heading">About Me</h2>
        <div class="about-text">
          <p>
            Hi! I'm Evan Steitz, a Product and Engineering leader and full-stack developer with expertise 
            in building teams, scaling systems, and delivering 0→1 product initiatives.
          </p>
          <p>
            This interactive command-line portfolio showcases my work and experience in a unique way. 
            Please explore using the available commands!
          </p>
          <p>
            I specialize in engineering leadership, team management, and building awesome products.
          </p>
        </div>
      </div>
      
      ${QuickSuggestions.generate(QuickSuggestions.MAIN_NAVIGATION, 'Quick Commands')}
    `;

    return {
      content,
      type: 'html'
    };
  }
};
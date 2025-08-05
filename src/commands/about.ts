import type { Command } from '@/types';

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
            Hi! I'm Evan Steitz, a passionate software developer who loves building 
            innovative solutions and exploring new technologies.
          </p>
          <p>
            This interactive command-line portfolio showcases my work and skills in a unique way. 
            Feel free to explore using the available commands!
          </p>
          <p>
            I specialize in full-stack development, with a focus on creating clean, 
            efficient, and user-friendly applications.
          </p>
        </div>
        <div class="quick-links">
          <h3>Quick Commands:</h3>
          <div class="command-suggestions">
            <span class="suggestion-chip" onclick="window.terminal.executeCommand('resume')">resume</span>
            <span class="suggestion-chip" onclick="window.terminal.executeCommand('projects')">projects</span>
            <span class="suggestion-chip" onclick="window.terminal.executeCommand('skills')">skills</span>
            <span class="suggestion-chip" onclick="window.terminal.executeCommand('contact')">contact</span>
          </div>
        </div>
      </div>
    `;

    return {
      content,
      type: 'html'
    };
  }
};
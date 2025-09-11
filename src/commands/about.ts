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
            I'm a software engineer, game designer, and leader who loves building things. Whether it's a SaaS, developer tools, business processes or video games; I get excited about solving tricky problems and making experiences that people enjoy.
          </p>
        </div>
        
        <h3 class="brutal-heading">Beyond Work</h3>
        <div class="about-text">
          <p>
            Games have always been a big part of my life. I grew up playing sports and later got hooked on competitive games like League of Legends, where I even spent some time as a shoutcaster. Over the years, I've created a variety of games myself — from a drinking card game to a video game released on Steam — and I'm currently building a baseball simulation game called <a href="https://tiny-teams.com?utm_source=evansteitz.com&utm_medium=portfolio&utm_campaign=about_page&utm_content=tiny_teams_link" target="_blank" rel="noopener noreferrer">Tiny Teams</a>.
          </p>
          <p>
            Outside of tech and game design, my life mostly revolves around my family. I have two young boys who keep me on my toes and make sure things are never boring. I stil try to stay active with sports, mostly Golf and Hockey. And I try to push myself to learn or do something new every day.
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
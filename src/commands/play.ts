import type { Command, CommandResponse } from '@/types';
import { PongGame } from '@/ui/PongGame';
import { QuickSuggestions } from '@/ui/QuickSuggestions';
import { analytics } from '@/services/analytics';

export const playCommand: Command = {
  name: 'play',
  description: 'Play some fun mini games in your browser',
  aliases: ['games'],
  suggestions: {
    subcommands: [
      { name: 'pong', description: 'Classic Pong game' }
    ]
  },
  handler: async (args: string[]): Promise<CommandResponse> => {
    const subcommand = args[0]?.toLowerCase();

    if (!subcommand) {
      // Show game directory
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="play-directory">
          <h2 class="brutal-heading">Games Directory</h2>
          <p>Available games to play:</p>
          
          <div class="games-list" style="margin: 1.5rem 0;">
            <div class="game-item brutal-box" style="margin-bottom: 1rem; padding: 1rem; cursor: pointer; transition: all 0.2s ease; user-select: none;" 
                 onclick="window.terminal.executeSelectedCommand('/play pong')"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='12px 12px 0 var(--color-shadow)'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='8px 8px 0 var(--color-shadow)'">
              <h3 style="margin: 0 0 0.5rem 0; color: var(--color-accent);">🏓 Pong</h3>
              <p style="margin: 0 0 0.5rem 0;">Classic arcade game. First to 5 points wins!</p>
              <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;"><strong>Click to play</strong> or type <strong>/play pong</strong></p>
            </div>
          </div>
          
          ${QuickSuggestions.generate([
            { command: '/play pong', label: '/play pong', description: 'Launch Pong game' }
          ], 'Quick Start')}
        </div>
      `;

      analytics.trackCommand('play', 'game', false, true);
      
      return {
        content,
        type: 'html'
      };
    }

    if (subcommand === 'pong') {
      // Launch Pong game
      const content = document.createElement('div');
      content.className = 'pong-game-container';
      
      // Add game header
      const header = document.createElement('div');
      header.className = 'pong-header brutal-box';
      header.innerHTML = `
        <h2 class="brutal-heading">Pong Game 🏓</h2>
        <p>Classic Pong! First to 5 points wins. Use the mouse, connect a controller, or use W/S/↑/↓ keys to control your paddle.</p>
      `;
      
      content.appendChild(header);
      
      // Create game wrapper and initialize game
      const gameWrapper = document.createElement('div');
      gameWrapper.className = 'pong-game-wrapper';
      content.appendChild(gameWrapper);
      
      // Initialize the game
      setTimeout(() => {
        new PongGame(gameWrapper);
      }, 100);
      
      // Track pong game start via play command
      analytics.trackGameStart('pong', 'direct');
      analytics.trackCommand('play', 'game', true, true);
      
      return {
        content,
        type: 'html'
      };
    }

    // Unknown game
    return {
      content: `Game "${subcommand}" not found. Type "/play" to see available games.`,
      type: 'text'
    };
  }
};
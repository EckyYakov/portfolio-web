import type { Command, CommandResponse, AutocompleteSuggestion } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';
import { EasterEggKeywords } from '@/ui/EasterEggKeywords';
import { PongGame } from '@/ui/PongGame';
import { HackerTerminal } from '@/ui/HackerTerminal';
import { GolfGame } from '@/ui/GolfGame';

export class CommandProcessor {
  private commands: Map<string, Command>;
  private history: string[];
  private historyIndex: number;
  private lastCommand: string | null = null;

  constructor() {
    this.commands = new Map();
    this.history = [];
    this.historyIndex = -1;
  }

  register(command: Command): void {
    this.commands.set(command.name.toLowerCase(), command);
    command.aliases?.forEach((alias: string) => {
      this.commands.set(alias.toLowerCase(), command);
    });
  }

  async execute(input: string): Promise<CommandResponse> {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return {
        content: '',
        type: 'text'
      };
    }

    // Check if command starts with /
    if (!trimmedInput.startsWith('/')) {
      // Handle easter eggs for non-command input
      const lowerInput = trimmedInput.toLowerCase();
      
      // Context-aware keyword detection
      if (this.lastCommand === 'post-pong') {
        // After showing post-game message, detect golf keywords
        if (lowerInput.includes('golf') || lowerInput.includes('challenge') || lowerInput === 'yes' || 
            lowerInput === 'y' || lowerInput === 'sure' || lowerInput === 'ok' || 
            lowerInput === 'okay' || lowerInput.includes('bring') || lowerInput.includes('game')) {
          // Launch golf game
          const content = document.createElement('div');
          content.className = 'golf-game-container';
          
          // Add compact game header
          const header = document.createElement('div');
          header.className = 'golf-header';
          header.innerHTML = `
            <h2 class="brutal-heading">Mini Golf Challenge 🏌️</h2>
            <p>You asked for it! 3 holes, see if you can beat par. Touch/aim with mouse, tap/click or SPACE to set power.</p>
          `;
          
          content.appendChild(header);
          
          // Initialize the game directly in the main container
          setTimeout(() => {
            new GolfGame(content);
          }, 100);
          
          this.lastCommand = 'golf-game';
          return {
            content,
            type: 'html'
          };
        }
      } else if (this.lastCommand === 'ping') {
        // After ping command, detect play keywords
        if (lowerInput.includes('play') || lowerInput === 'yes' || lowerInput === 'y' || 
            lowerInput === 'sure' || lowerInput === 'ok' || lowerInput === 'okay' ||
            lowerInput.includes('let') || lowerInput.includes('game')) {
          // Trigger the pong game
          const content = document.createElement('div');
          content.className = 'pong-game-container';
          
          // Add game header
          const header = document.createElement('div');
          header.className = 'pong-header brutal-box';
          header.innerHTML = `
            <h2 class="brutal-heading">Pong Game 🏓</h2>
            <p>You said yes! Classic Pong time. First to 5 points wins. Use mouse or W/S/↑/↓ keys to control your paddle.</p>
            <p style="font-size: 0.9rem; opacity: 0.8;">Tip: Run any other command to exit the game.</p>
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
          
          this.lastCommand = 'pong-game';
          return {
            content,
            type: 'html'
          };
        }
      }
      
      if (lowerInput === 'hello') {
        const content = document.createElement('div');
        const hackText = EasterEggKeywords.makeClickable(
          'Are you trying to <span style="color: var(--color-accent); font-weight: bold;">hack</span> me or something? Good luck.',
          'hack'
        );
        
        content.innerHTML = `
          <div class="easter-egg-response">
            <p><strong>Hello! What are you doing? 👋</strong></p>
            <p>${hackText}</p>
            <p style="margin-top: 1rem;">Here are some commands to get you started:</p>
          </div>
          ${QuickSuggestions.generate(QuickSuggestions.HELP_RELATED, 'Quick Commands')}
          <p style="margin-top: 1rem; font-style: italic;">Type any command starting with "/" to explore!</p>
        `;
        this.lastCommand = 'hello';
        return {
          content,
          type: 'html'
        };
      }
      
      if (lowerInput === 'ping') {
        const content = document.createElement('div');
        const playText = EasterEggKeywords.makeClickable(
          'You know what, that actually sounds pretty fun. I wish I had someone to play with...',
          'play',
          'lets play'
        );
        
        content.innerHTML = `
          <div class="easter-egg-response">
            <p><strong>Pong 🏓</strong></p>
            <p style="margin-top: 1rem;">${playText}</p>
          </div>
          ${QuickSuggestions.generate([
            { command: '/help', label: '/help', description: 'See all available commands' },
            { command: '/about', label: '/about', description: 'Learn about me' },
            { command: '/resume', label: '/resume', description: 'View my resume' }
          ], 'Try These Commands')}
        `;
        this.lastCommand = 'ping';
        return {
          content,
          type: 'html'
        };
      }
      
      if (lowerInput === 'lets play') {
        const content = document.createElement('div');
        content.className = 'pong-game-container';
        
        // Add compact game header
        const header = document.createElement('div');
        header.className = 'pong-header';
        header.innerHTML = `
          <h2 class="brutal-heading">Pong Game 🏓</h2>
          <p>Classic Pong! First to 5 points wins. Touch or use mouse/W/S/↑/↓ to control your paddle.</p>
        `;
        
        content.appendChild(header);
        
        // Initialize the game directly in the main container
        setTimeout(() => {
          new PongGame(content);
        }, 100);
        
        this.lastCommand = 'pong-game';
        return {
          content,
          type: 'html'
        };
      }
      
      // Pong game easter egg - direct entry  
      if (lowerInput === 'pong' || lowerInput === 'ping pong') {
        const content = document.createElement('div');
        content.className = 'pong-game-container';
        
        // Add compact game header
        const header = document.createElement('div');
        header.className = 'pong-header';
        header.innerHTML = `
          <h2 class="brutal-heading">Pong Game 🏓</h2>
          <p>Found the pong game! First to 5 points wins. Touch or use mouse/W/S/↑/↓ to control your paddle.</p>
        `;
        
        content.appendChild(header);
        
        // Initialize the game directly in the main container
        setTimeout(() => {
          new PongGame(content);
        }, 100);
        
        this.lastCommand = 'pong-game';
        return {
          content,
          type: 'html'
        };
      }

      // Golf game easter egg - direct entry
      if (lowerInput === 'golf' || lowerInput === 'golfer' || lowerInput === 'mini golf' || 
          lowerInput === 'minigolf') {
        const content = document.createElement('div');
        content.className = 'golf-game-container';
        
        // Add compact game header
        const header = document.createElement('div');
        header.className = 'golf-header';
        header.innerHTML = `
          <h2 class="brutal-heading">Mini Golf Challenge 🏌️</h2>
          <p>Found the golf game! 3 holes, see if you can beat par. Touch/aim with mouse, tap/click or SPACE to set power.</p>
        `;
        
        content.appendChild(header);
        
        // Initialize the game directly in the main container
        setTimeout(() => {
          new GolfGame(content);
        }, 100);
        
        this.lastCommand = 'golf-game';
        return {
          content,
          type: 'html'
        };
      }
      
      // Hacker terminal easter egg
      if (lowerInput === 'hack' || lowerInput === 'hacker' || lowerInput === 'hackerman' || 
          lowerInput === 'matrix' || lowerInput === 'sudo' || lowerInput === 'root') {
        const content = document.createElement('div');
        content.className = 'hacker-terminal-container';
        
        // Initialize the hacker terminal
        setTimeout(() => {
          new HackerTerminal(content);
        }, 100);
        
        this.lastCommand = 'hack';
        return {
          content,
          type: 'html'
        };
      }
      
      // Default fallback for other non-command input
      this.lastCommand = null; // Clear context for unknown input
      return {
        content: `Commands must start with /. Type '/help' for available commands.`,
        type: 'text'
      };
    }

    this.addToHistory(trimmedInput);
    
    // Clear easter egg context when using regular commands
    this.lastCommand = null;

    // Remove the / prefix and parse command
    const commandPart = trimmedInput.slice(1);
    const [cmdName, ...args] = commandPart.split(' ');
    const command = this.commands.get(cmdName.toLowerCase());

    if (!command) {
      return {
        content: `Command not found: /${cmdName}. Type '/help' for available commands.`,
        type: 'text'
      };
    }

    try {
      return await command.handler(args);
    } catch (error) {
      return {
        content: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'text'
      };
    }
  }

  getCommands(): Command[] {
    const uniqueCommands = new Map<string, Command>();
    this.commands.forEach((command, name) => {
      if (command.name === name) {
        uniqueCommands.set(name, command);
      }
    });
    return Array.from(uniqueCommands.values());
  }

  getSuggestions(partial: string): AutocompleteSuggestion[] {
    // If input is just "/", show all commands
    if (partial === '/') {
      const suggestions: AutocompleteSuggestion[] = [];
      this.commands.forEach((command, name) => {
        if (command.name === name) {
          suggestions.push({
            command: `/${name}`,
            description: command.description,
            displayText: `/${name}`
          });
        }
      });
      return suggestions.sort((a, b) => a.command.localeCompare(b.command));
    }

    // If input starts with "/", handle command completion and subcommand/argument suggestions
    if (partial.startsWith('/')) {
      const parts = partial.slice(1).split(' ');
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      // If we're still typing the command name (no spaces yet)
      if (parts.length === 1) {
        const suggestions: AutocompleteSuggestion[] = [];
        this.commands.forEach((command, name) => {
          if (name.startsWith(commandName) && command.name === name) {
            // Add the base command
            suggestions.push({
              command: `/${name}`,
              description: command.description,
              displayText: `/${name}`
            });
            
            // If this is an exact match and the command has suggestions, also show subcommands/arguments
            if (name === commandName && command.suggestions) {
              // Add subcommands
              if (command.suggestions.subcommands) {
                command.suggestions.subcommands.forEach(subcommand => {
                  const fullCommand = `/${name} ${subcommand.name}`;
                  const displayText = subcommand.params ? `${subcommand.name} ${subcommand.params}` : subcommand.name;
                  
                  suggestions.push({
                    command: fullCommand,
                    description: subcommand.description,
                    displayText: displayText
                  });
                });
              }
              
              // Add arguments
              if (command.suggestions.arguments) {
                command.suggestions.arguments.forEach(argument => {
                  const fullCommand = `/${name} ${argument.name}`;
                  const displayText = argument.params ? `${argument.name} ${argument.params}` : argument.name;
                  
                  suggestions.push({
                    command: fullCommand,
                    description: argument.description,
                    displayText: displayText
                  });
                });
              }
            }
          }
        });
        return suggestions.sort((a, b) => a.command.localeCompare(b.command));
      }
      
      // If we have a complete command name followed by a space, show subcommands/arguments
      const command = this.commands.get(commandName);
      if (command && command.suggestions) {
        const suggestions: AutocompleteSuggestion[] = [];
        const currentArg = args[args.length - 1] || '';
        
        // Add subcommands if they match current input
        if (command.suggestions.subcommands) {
          command.suggestions.subcommands.forEach(subcommand => {
            if (subcommand.name.toLowerCase().startsWith(currentArg.toLowerCase())) {
              // Reconstruct the full command with the subcommand
              const baseCommand = `/${commandName}`;
              const existingArgs = args.slice(0, -1);
              const fullCommand = `${baseCommand} ${existingArgs.join(' ')} ${subcommand.name}`.trim();
              const displayText = subcommand.params ? `${subcommand.name} ${subcommand.params}` : subcommand.name;
              
              suggestions.push({
                command: fullCommand,
                description: subcommand.description,
                displayText: displayText
              });
            }
          });
        }
        
        // Add arguments if they match current input
        if (command.suggestions.arguments) {
          command.suggestions.arguments.forEach(argument => {
            if (argument.name.toLowerCase().startsWith(currentArg.toLowerCase())) {
              // Reconstruct the full command with the argument
              const baseCommand = `/${commandName}`;
              const existingArgs = args.slice(0, -1);
              const fullCommand = `${baseCommand} ${existingArgs.join(' ')} ${argument.name}`.trim();
              const displayText = argument.params ? `${argument.name} ${argument.params}` : argument.name;
              
              suggestions.push({
                command: fullCommand,
                description: argument.description,
                displayText: displayText
              });
            }
          });
        }
        
        return suggestions.sort((a, b) => a.command.localeCompare(b.command));
      }
    }

    // If no "/" prefix, return empty suggestions
    return [];
  }

  private addToHistory(command: string): void {
    if (this.history.length === 0 || this.history[this.history.length - 1] !== command) {
      this.history.push(command);
    }
    this.historyIndex = this.history.length;
  }

  getPreviousCommand(): string | null {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.history[this.historyIndex];
    }
    return null;
  }

  getNextCommand(): string | null {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.historyIndex];
    } else if (this.historyIndex === this.history.length - 1) {
      this.historyIndex = this.history.length;
      return '';
    }
    return null;
  }

  setLastCommand(command: string): void {
    this.lastCommand = command;
  }

}
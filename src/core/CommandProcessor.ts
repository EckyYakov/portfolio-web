import type { Command, CommandResponse, AutocompleteSuggestion } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';
import { EasterEggKeywords } from '@/ui/EasterEggKeywords';
import { HackerMode } from '@/ui/HackerMode';
import { analytics } from '@/services/analytics';

export class CommandProcessor {
  private commands: Map<string, Command>;
  private commandsArray: Command[]; // Keep original order
  private history: string[];
  private historyIndex: number;
  private hackerMode: HackerMode;

  constructor() {
    this.commands = new Map();
    this.commandsArray = [];
    this.history = [];
    this.historyIndex = -1;
    this.hackerMode = HackerMode.getInstance();
  }

  register(command: Command): void {
    this.commands.set(command.name.toLowerCase(), command);
    this.commandsArray.push(command); // Store in array to preserve order
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

    // Handle hacker mode commands (without / prefix)
    if (this.hackerMode.isHackerModeActive() && !trimmedInput.startsWith('/')) {
      const [cmdName, ...args] = trimmedInput.split(' ');
      const response = await this.hackerMode.executeHackerCommand(cmdName, args);
      
      if (response) {
        return response;
      } else {
        // Show available hacker commands if command not found
        return {
          content: `Unknown hacker command: ${cmdName}. Available commands: scan, exploit, decrypt, backdoor, exit`,
          type: 'text'
        };
      }
    }

    // Check if command starts with /
    if (!trimmedInput.startsWith('/')) {
      // Handle easter eggs for non-command input
      const lowerInput = trimmedInput.toLowerCase();
      
      
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
        
        // Track hello easter egg
        analytics.trackEasterEgg('hello', 'hello');
        
        return {
          content,
          type: 'html'
        };
      }
      
      if (lowerInput === 'ping') {
        return {
          content: `Pong! 🏓 Try "/play pong" or just "/play" to see available games.`,
          type: 'text'
        };
      }
      
      // Game easter eggs - redirect to /play command
      if (lowerInput === 'lets play' || lowerInput === 'play') {
        return {
          content: `Let's play! 🎮 Try "/play" to see available games or "/play pong" to jump right in.`,
          type: 'text'
        };
      }
      
      if (lowerInput === 'pong' || lowerInput === 'ping pong') {
        return {
          content: `🏓 Try "/play pong" to start a game of Pong!`,
          type: 'text'
        };
      }

      if (lowerInput === 'golf' || lowerInput === 'golfer' || lowerInput === 'mini golf' || 
          lowerInput === 'minigolf') {
        return {
          content: `🏌️ Golf games coming soon! For now, try "/play" to see available games.`,
          type: 'text'
        };
      }
      
      // Hacker terminal easter egg
      if (lowerInput === 'hack' || lowerInput === 'hacker' || lowerInput === 'hackerman' || 
          lowerInput === 'matrix' || lowerInput === 'sudo' || lowerInput === 'root') {
        
        // Enter hacker mode
        this.hackerMode.enterHackerMode();
        
        const content = document.createElement('div');
        content.className = 'hacker-mode-entry';
        
        content.innerHTML = `
          <div class="hacker-entry-message" style="text-align: center; padding: 2rem;">
            <h2 style="color: #00ff00; margin: 0 0 .5rem 0; text-shadow: 0 0 10px #00ff00;">
             HACKED TERMINAL ACCESS GRANTED
            </h2>
            <p style="margin: 2rem 0; color: #00ff00; font-family: 'Courier New', monospace;">
              Welcome.
            </p>
            <p style="margin: 0; opacity: 0.8; font-family: 'Courier New', monospace;">
              Available commands: ls, open [filename], help
            </p>
          </div>
        `;
        
        // Track hacker mode entry
        analytics.trackEasterEgg('hacker_mode', lowerInput);
        analytics.trackGameStart('hacker', 'direct');
        
        return {
          content,
          type: 'html'
        };
      }
      
      // Default fallback for other non-command input
      return {
        content: `Commands must start with /. Type '/help' for available commands.`,
        type: 'text'
      };
    }

    this.addToHistory(trimmedInput);

    // Remove the / prefix and parse command
    const commandPart = trimmedInput.slice(1);
    const [cmdName, ...args] = commandPart.split(' ');
    const command = this.commands.get(cmdName.toLowerCase());

    if (!command) {
      // Track command not found
      analytics.trackCommand(cmdName, 'navigation', args.length > 0, false);
      analytics.trackError('command_not_found', `Command not found: /${cmdName}`, cmdName);
      
      return {
        content: `Command not found: /${cmdName}. Type '/help' for available commands.`,
        type: 'text'
      };
    }

    try {
      // Track successful command execution
      const commandType = this.getCommandType(command.name);
      analytics.trackCommand(command.name, commandType, args.length > 0, true);
      
      return await command.handler(args);
    } catch (error) {
      // Track command execution error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      analytics.trackError('command_execution_error', errorMessage, command.name);
      
      return {
        content: `Error executing command: ${errorMessage}`,
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
    // In hacker mode, provide suggestions for hacker commands only
    if (this.hackerMode.isHackerModeActive()) {
      return this.getHackerModeSuggestions(partial);
    }

    // If input is just "/", show all commands in original registration order
    if (partial === '/') {
      const suggestions: AutocompleteSuggestion[] = [];
      
      // Use the commandsArray to preserve registration order
      this.commandsArray.forEach((command) => {
        suggestions.push({
          command: `/${command.name}`,
          description: command.description,
          displayText: `/${command.name}`
        });
      });
      
      return suggestions;
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
        // Return suggestions in the order they appear (no sorting)
        return suggestions;
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
        
        // Return suggestions in the order they appear (no sorting)
        return suggestions;
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


  private getHackerModeSuggestions(partial: string): AutocompleteSuggestion[] {
    if (!partial || partial.length === 0) {
      // Show all hacker commands when no input
      const suggestions: AutocompleteSuggestion[] = [];
      const hackerCommands = this.hackerMode.getHackerCommands();
      
      hackerCommands.forEach((command) => {
        // Only show decrypt command if there are encrypted files available
        if (command.name === 'decrypt' && !this.hackerMode.hasEncryptedFiles()) {
          return; // Skip decrypt command if no encrypted files
        }
        
        suggestions.push({
          command: command.name,
          description: command.description,
          displayText: command.name
        });
      });
      
      return suggestions;
    }

    const parts = partial.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // If we're still typing the command name (no spaces yet)
    if (parts.length === 1) {
      const suggestions: AutocompleteSuggestion[] = [];
      const hackerCommands = this.hackerMode.getHackerCommands();
      
      hackerCommands.forEach((command) => {
        if (command.name.toLowerCase().startsWith(commandName)) {
          // Only show decrypt command if there are encrypted files available
          if (command.name === 'decrypt' && !this.hackerMode.hasEncryptedFiles()) {
            return; // Skip decrypt command if no encrypted files
          }
          
          suggestions.push({
            command: command.name,
            description: command.description,
            displayText: command.name
          });
        }
      });
      
      return suggestions;
    }

    // If we have a complete command name followed by a space, show argument suggestions
    const hackerCommands = this.hackerMode.getHackerCommands();
    const command = hackerCommands.get(commandName);
    
    if (command && command.suggestions) {
      const suggestions: AutocompleteSuggestion[] = [];
      const currentArg = args[args.length - 1] || '';
      
      // Add arguments if they match current input
      if (command.suggestions.arguments) {
        command.suggestions.arguments.forEach((argument) => {
          if (argument.name.toLowerCase().startsWith(currentArg.toLowerCase())) {
            const baseCommand = commandName;
            const existingArgs = args.slice(0, -1);
            const fullCommand = `${baseCommand} ${existingArgs.join(' ')} ${argument.name}`.trim();
            
            suggestions.push({
              command: fullCommand,
              description: argument.description,
              displayText: argument.name
            });
          }
        });
      }
      
      return suggestions;
    }

    return [];
  }

  /**
   * Determine the command type for analytics tracking
   */
  private getCommandType(commandName: string): 'navigation' | 'utility' | 'easter_egg' | 'game' {
    switch (commandName.toLowerCase()) {
      case 'help':
      case 'about':
      case 'resume':
      case 'contact':
        return 'navigation';
      case 'clear':
      case 'theme':
        return 'utility';
      default:
        return 'navigation';
    }
  }

}
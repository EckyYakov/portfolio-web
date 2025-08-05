import type { Command, CommandResponse, AutocompleteSuggestion } from '@/types';

export class CommandProcessor {
  private commands: Map<string, Command>;
  private history: string[];
  private historyIndex: number;

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
}
import type { Command, CommandResponse } from '@/types';

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

  getSuggestions(partial: string): string[] {
    // If input is just "/", show all commands
    if (partial === '/') {
      const suggestions: string[] = [];
      this.commands.forEach((command, name) => {
        if (command.name === name) {
          suggestions.push(`/${name}`);
        }
      });
      return suggestions.sort();
    }

    // If input starts with "/", match against command names
    if (partial.startsWith('/')) {
      const commandPart = partial.slice(1).toLowerCase();
      const suggestions: string[] = [];
      
      this.commands.forEach((command, name) => {
        if (name.startsWith(commandPart) && command.name === name) {
          suggestions.push(`/${name}`);
        }
      });

      return suggestions.sort();
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
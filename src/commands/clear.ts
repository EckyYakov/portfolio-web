import type { Command } from '@/types';

export const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal',
  aliases: ['cls'],
  handler: async () => {
    const terminal = (window as any).terminal;
    if (terminal) {
      terminal.clear();
    }
    
    return {
      content: '',
      type: 'text'
    };
  }
};